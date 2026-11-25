# Virtual School

A browser-based 3D school tour with a project-based English mission for B1 learners. Explore a Kazakhstan-inspired campus, visit eight locations, speak with guides, collect English vocabulary with Kazakh and Russian translations, and draft a short presentation.

## Run locally

Use Node.js 22 and npm from this directory.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. To access the site from a phone on the same local network, use `npm run dev -- --host 0.0.0.0` and open the Network URL printed by Vite.

```sh
npm run check
npm run build
npm run preview
```

## Explore and learn

- **Guided tour.** Click a door or its hotspot to change locations. The bottom bar has Previous, Next, and the mode toggle. Campus map lets you choose any room directly.
- **Free roam.** Switch modes from the bottom bar. Move with WASD, arrow keys, or the touch joystick. Drag to look around. Rapier keeps you outside walls and collidable furnishings. Click doors to change rooms.
- **Guides and objects.** Click a character or exhibit, or use the audio and book buttons. Listen to the guide, read the passage, collect vocabulary, and answer the challenge. Speaking prompts are self-practice. Speech playback depends on browser and device voices.
- **Mission.** Visit four learning spaces, talk to three guides, collect four words, pass three challenges, and draft a presentation of 25 words or more. Mission goals, achievements, points, and the draft are stored in the current browser. Clearing site data resets progress.
- **Settings.** Select English, Kazakh, or Russian for navigation and room labels. Learning activities stay in English for practice. Low graphics disables shadows and caps the render resolution. Fullscreen is available where the browser supports it.

## Project layout

| File               | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `src/main.tsx`     | Menus, HUD, settings, speech, activities, and progress                  |
| `src/World.tsx`    | Renderer, 360° drag camera, movement, model loader, and panorama sphere |
| `src/Campus.tsx`   | Procedural courtyard, indoor rooms, portals, and exhibits               |
| `src/geometry.tsx` | Reusable meshes, signs, flag, and character animation                   |
| `src/data.ts`      | Rooms, links, translations, vocabulary, and challenges                  |
| `src/panoramas.ts` | Photo location and hotspot configuration                                |
| `public/assets/`   | Local folders for GLB/GLTF, textures, panorama photos, audio, and icons |

The exterior and each interior are separate scenes joined by clickable doors. This keeps the active scene smaller and makes the tour stops consistent across devices. The campus uses procedural meshes, with all lettering generated locally. No third-party model, photo, or audio packs are bundled. Interface icons use Lucide, distributed under the ISC license.

## Add a panorama or model

To enable **360° Photos** in Settings, put a licensed 2:1 equirectangular photo in `public/assets/panoramas` and add an item to the `panoramas` array. Example configuration for a photo you supply:

```ts
{
  name: 'School entrance',
  image: 'my-entrance-photo.jpg',
  hotspots: [
    { yaw: 0, pitch: -5, label: 'Campus guide', guide: true,
      information: 'Welcome to our school.' },
    { yaw: 20, pitch: 0, label: 'Entrance hall', destination: 1 }
  ]
}
```

Angles are in degrees. A destination is the index of another entry in the array. Add that entry before creating the hotspot. Photos use drag to rotate and mouse wheel or touch pinch to zoom. The project opens in the generated school by default.

Place GLB or GLTF assets under `public/assets/models` and render the exported `ImportedModel` component inside the canvas. Pass it a URL with `import.meta.env.BASE_URL`. Keep any GLTF companions in the same directory. Add a Rapier collider for each imported obstacle and document third-party assets and licenses here when adding them.

## GitHub Pages

Publish this folder as the root of a GitHub repository. Under **Settings → Pages → Build and deployment**, choose **GitHub Actions**. Push to `main` or run **Deploy Virtual School to Pages** manually. The included workflow builds from the lockfile and publishes `dist/`. Vite emits relative asset URLs for both repository and root Pages sites.

## Development stages

1. Implement the courtyard, two connecting interior stops, English classroom, camera, and first challenge.
2. Add the Physics Lab, Computer Lab, Library, and Museum.
3. Add animated guides, vocabulary, dialogue, and assessments across the campus.
4. Connect mobile exploration, the map, mission persistence, and configurable photo panoramas.
5. Check browser routes and controls, responsive layouts, and the production build.

## Digital Storytelling Classroom

See [Digital Storytelling Classroom setup](STORYTELLING.md) for the example video, private submissions, teacher dashboard, and deployment.
