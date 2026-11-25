insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('storytelling-videos', 'storytelling-videos', false, 200000000, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.storytelling_submissions (
  id uuid primary key,
  secret_hash text not null,
  source_hash text not null,
  student_name text not null,
  class_group text not null,
  story_title text not null,
  description text not null,
  message text not null default '',
  consent boolean not null check (consent),
  filename text not null,
  size_bytes bigint not null check (size_bytes > 0),
  mime text not null,
  object_path text not null unique,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'uploading' check (status in ('uploading','submitted','assessed','deleting','deleted')),
  email_status text not null default 'pending' check (email_status in ('pending','sending','sent','failed','review')),
  email_first_attempt_at timestamptz,
  email_last_attempt_at timestamptz,
  email_provider_id text,
  email_error text,
  scores smallint[],
  feedback text not null default ''
);
create index storytelling_submission_created on public.storytelling_submissions (created_at desc);
create index storytelling_submission_rate on public.storytelling_submissions (source_hash, created_at desc);
create index storytelling_submission_queue on public.storytelling_submissions (status, email_status, submitted_at desc);
alter table public.storytelling_submissions enable row level security;
revoke all on public.storytelling_submissions from public, anon, authenticated;
grant select, insert, update, delete on public.storytelling_submissions to service_role;

-- A restrictive policy also blocks access if another app adds a permissive
-- storage policy for every bucket. The service role issues signed capabilities.
create policy "Storytelling objects are private" on storage.objects as restrictive
  for all to anon, authenticated
  using (bucket_id <> 'storytelling-videos')
  with check (bucket_id <> 'storytelling-videos');

create function public.reserve_storytelling_submission(project jsonb)
returns void language plpgsql set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(49312681);
  if exists (select 1 from public.storytelling_submissions where id = (project->>'id')::uuid) then
    return;
  end if;
  if (select count(*) from public.storytelling_submissions
      where source_hash = project->>'source_hash' and created_at > now() - interval '1 hour') >= 45
    or (select count(*) from public.storytelling_submissions
      where created_at > now() - interval '1 hour') >= 150 then
    raise exception 'storytelling_rate_limit' using errcode = 'P0001';
  end if;
  insert into public.storytelling_submissions
    (id, secret_hash, source_hash, student_name, class_group, story_title, description, message, consent, filename, size_bytes, mime, object_path)
  values ((project->>'id')::uuid, project->>'secret_hash', project->>'source_hash', project->>'student_name',
    project->>'class_group', project->>'story_title', project->>'description', project->>'message', true,
    project->>'filename', (project->>'size_bytes')::bigint, project->>'mime', project->>'object_path');
end;
$$;
revoke execute on function public.reserve_storytelling_submission(jsonb) from public, anon, authenticated;
grant execute on function public.reserve_storytelling_submission(jsonb) to service_role;
