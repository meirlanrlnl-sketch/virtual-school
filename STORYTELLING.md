# Digital Storytelling Classroom

Open the classroom through the hallway door or Campus Map. The school’s English, Kazakh, and Russian settings apply to the room name and zone navigation. The lesson and project instructions use B1 English. Draft storyboards, reflections, and checklists are stored in the current browser. Storyboards can also be downloaded as text files.

## Example video

Save the approved example to `public/videos/storytelling-example.mp4`. Vite also detects `storytelling-example.webm` or `storytelling-example.mov` at startup and build time. If all are absent, the screening area displays instructions. MP4 with H.264 video and AAC audio works across more browsers. Add `public/videos/storytelling-example.vtt` for optional English captions. Restart Vite after adding or renaming the file. The example is a public site asset. Student submissions use separate private storage.

## Supabase setup

1. Create or select a Supabase project. In Storage settings, set the global upload limit to at least 200 MB using a plan that supports that size, or choose a lower limit. The migration sets the private `storytelling-videos` bucket to 200,000,000 bytes and allows video/mp4, video/quicktime, and video/webm. For a different limit, change the bucket limit in Storage settings and set `STORY_MAX_VIDEO_BYTES` to the same byte value. The browser reads the limit from the server.
2. A teacher account is optional for receiving submissions. Without `STORY_TEACHER_USER_ID`, each email contains a private video download link that expires 24 hours after submission. To also use the teacher dashboard, create a confirmed teacher account in Authentication → Users, use a strong password, and copy its user UUID into `STORY_TEACHER_USER_ID`. If this project is used only for this classroom, disable public sign-ups. Student uploads use signed upload sessions and require no Supabase account. New sessions are limited to 45 per network address and 150 per project each hour. Active sessions can retry without using new slots.
3. Verify a sender domain in Resend, including its required DNS records, and create a send-only API key for that domain. Use an address at that verified domain as the sender. Notifications go to `meirlanrlnl@gmail.com`.
4. From the Virtual School directory, link the Supabase project, apply the migration, and deploy the function with the Supabase CLI.

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   supabase functions deploy storytelling
   ```

5. Add the following values in Supabase → Edge Functions → Secrets. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the hosted function. The service key, Resend key, and secret values stay on the server.

   | Secret | Value |
   | --- | --- |
   | `STORY_TEACHER_USER_ID` | Optional confirmed teacher account UUID; required only for the dashboard |
   | `STORY_ALLOWED_ORIGINS` | Comma-separated origins without paths or trailing slashes, for example `https://YOUR_USER.github.io,http://localhost:5173` |
   | `STORY_FRONTEND_URL` | The full school URL with its repository path and trailing slash, for example `https://YOUR_USER.github.io/YOUR_REPO/` |
   | `STORY_EMAIL_FROM` | A verified sender, for example `Virtual School <stories@YOUR_DOMAIN>` |
   | `RESEND_API_KEY` | The send-only Resend key |
   | `STORY_RATE_LIMIT_SALT` | A random secret of at least 32 characters, for example from `openssl rand -hex 32` |
   | `STORY_MAINTENANCE_KEY` | A different random secret of at least 32 characters if scheduling maintenance |
   | `STORY_MAX_VIDEO_BYTES` | Optional, defaults to `200000000` |
   | `STORY_STORAGE_URL` | Optional override, usually only needed in local or self-hosted environments |

6. Set the browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in GitHub Actions repository **Variables** and rebuild Pages. For local development use the same names in `.env.local`. The classroom disables online submission until its configuration endpoint is available. The existing Pages workflow still builds and publishes `dist`.

## Teacher dashboard and notifications

Supabase Storage always holds the video privately, and the email contains a link rather than a large attachment. If `STORY_TEACHER_USER_ID` is not configured, the email link downloads only that submission and expires 24 hours after the student submits it.

To use the dashboard, configure `STORY_TEACHER_USER_ID`, open **Teacher dashboard** in the school settings (or append `#teacher` to the school URL), and sign in. Each email then links to the relevant teacher record. The dashboard issues five-minute signed playback and download links after checking the teacher account.

Resend acceptance and inbox delivery are separate events. The dashboard reports API acceptance and retains failed or pending notifications. Use **Retry email** on a record or **Check pending email and uploads** in the dashboard. In production, schedule a maintenance POST about every five minutes using Supabase Cron or an equivalent scheduled job. Store its secret in Supabase Vault or your scheduler’s secret store.

```text
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/storytelling
Content-Type: application/json
apikey: YOUR_PUBLISHABLE_KEY
x-story-maintenance: YOUR_MAINTENANCE_SECRET
{"action":"maintenance"}
```

A stable Resend idempotency key protects retries within the provider’s 24-hour window. The function stops retries after 23 hours from the first attempt and marks uncertain notifications for teacher review. Review the Resend logs before sending any follow-up manually. Maintenance also removes abandoned uploads and deletion tombstones after 51 hours, beyond the upload authorization and resumable session lifetimes. Dashboard deletion immediately removes the current private object and clears student details when storage removal succeeds.

## Testing

Run `npm run check` and `npm run build`. Then start `npm run dev` and try the classroom on desktop and in a mobile viewport. The lesson and main school work with the upload backend disabled.

Use a separate Supabase project and test account to check real integrations. Use a test copy of a video and synthetic student details. A successful upload will email the configured teacher address.

| Scenario | Expected result |
| --- | --- |
| Valid video | Private object is stored first, then a single submission appears in the dashboard. The receipt shows upload and email status. |
| Wrong file type or renamed image | Rejected during file selection or server verification. |
| Oversized video | Rejected before upload authorization. |
| Interrupted upload | Restore the connection and click **Retry upload** in the same panel. The browser reads the last stored offset and continues. |
| Double-click or repeated finish request | The same attempt produces one finalized record and one idempotent email. |
| Unauthenticated or different account | Dashboard API returns 401 or 403. Direct public bucket access is denied. |
| Missing frontend or backend settings | Upload remains disabled and no receipt appears. |
| Resend rejects the email | Video and record remain, and the receipt shows the failed email status. Restore the provider and retry in the dashboard. |
| Assess or remove a video | Scores and feedback persist after reload. Deletion removes the video and its listing. |

References for deployment and integration
- [Supabase resumable uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)
- [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)
- [Supabase Edge Function authorization](https://supabase.com/docs/guides/functions/auth-headers)
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
