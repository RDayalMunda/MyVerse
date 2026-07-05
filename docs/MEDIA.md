# Media Upload (Frontend)

> Profile and project image upload via `POST /media/upload` and `POST /media/upload/image`.

**Related:** [PROJECT.md](./PROJECT.md) · [STAFF.md](./STAFF.md) · [Backend REGISTRATION.md](../My-Verse-Backend/docs/REGISTRATION.md) · [Postman Media folder](../My-Verse-Backend/postman/README.md)

---

## Overview

Images are uploaded first via multipart form, then the returned `FileMeta` is sent in JSON on subsequent requests (profile picture, section IMAGE items).

## Profile upload flow

1. User picks an image (expo-image-picker)
2. `POST /media/upload` with `multipart/form-data`, field name `file`
3. Server returns `FileMeta` — attach to `profilePicture` on register/update

## Project image upload flow (Slice 2)

1. Admin picks one or more images in the photoshoot wizard
2. `POST /media/upload/image` per photo
3. Server returns `FileMeta` — attach as `file` on `POST .../items` with `kind: IMAGE`

## Limits

| Endpoint | Max size | MIME types |
|----------|----------|------------|
| `/media/upload` (profile) | 5 MB | jpeg, png, webp |
| `/media/upload/image` (project) | 10 MB | jpeg, png, webp |

Auth: public (no token required for upload).

## Display

Use `mediaUrl(path)` from `src/lib/media-url.ts` to prepend the API origin to paths like `/api/v1/media/images/{mediaId}`.

## Fullscreen image viewer

Tap to expand images in a modal gallery:

| Surface | Trigger |
|---------|---------|
| Photoshoot project detail | Tap inline photo → fullscreen; swipe or prev/next between section images |
| Staff directory card | Tap avatar |
| Staff profile detail | Tap hero avatar |

Component: `src/components/media/fullscreen-image-viewer.tsx`  
Hook: `useImageGallery()` — `{ openGallery, galleryProps }`

## Key files

| File | Role |
|------|------|
| `src/api/media.api.ts` | `uploadProfileImage()`, `uploadProjectImage()` |
| `src/api/client.ts` | `uploadFormData()` — no Content-Type header |
| `src/lib/media-url.ts` | `mediaUrl()` helper |
| `src/components/media/profile-image-picker.tsx` | Profile pick, preview, upload |
| `src/components/media/fullscreen-image-viewer.tsx` | Fullscreen gallery modal + `useImageGallery` |
| `src/components/admin/create-photoshoot-wizard.tsx` | Multi-photo pick + project upload |

## Cross-platform FormData

- **Native:** append `{ uri, name, type }` blob
- **Web:** append `File` from picker result

## Out of scope (Slice 3)

- `POST /media/upload/video` for show section items
