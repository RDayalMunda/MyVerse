# Media Upload (Frontend)

> Profile image upload via `POST /media/upload`. Project image upload deferred to Slice 2.

**Related:** [STAFF.md](./STAFF.md) · [Backend REGISTRATION.md](../My-Verse-Backend/docs/REGISTRATION.md) · [Postman Media folder](../My-Verse-Backend/postman/README.md)

---

## Overview

Staff registration and profile updates require a profile picture. Images are uploaded first, then the returned `FileMeta` is sent in JSON on register/update endpoints.

## Upload flow

1. User picks an image (expo-image-picker)
2. `POST /media/upload` with `multipart/form-data`, field name `file`
3. Server returns `FileMeta` — attach to `profilePicture` on subsequent JSON requests

## Limits

| Constraint | Value |
|------------|-------|
| Max size | 5 MB |
| MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Auth | Public (no token required) |

## Display

Use `mediaUrl(path)` from `src/lib/media-url.ts` to prepend the API origin to paths like `/api/v1/media/images/{mediaId}`.

## Key files

| File | Role |
|------|------|
| `src/api/media.api.ts` | `uploadProfileImage()` |
| `src/api/client.ts` | `uploadFormData()` — no Content-Type header |
| `src/lib/media-url.ts` | `mediaUrl()` helper |
| `src/components/media/profile-image-picker.tsx` | Pick, preview, upload |

## Cross-platform FormData

- **Native:** append `{ uri, name, type }` blob
- **Web:** append `File` from picker result

## Out of scope (Slice 2)

- `POST /media/upload/image` for project section items
