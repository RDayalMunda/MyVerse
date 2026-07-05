# Projects Module (Frontend)

> Admin creates BOOK and PHOTOSHOOT projects, publishes them; consumers read on the project detail screen with a shared section picker (Netflix-style “season” selector).

**Related:** [ROADMAP.md](./ROADMAP.md) · [AUTH.md](./AUTH.md) · [MEDIA.md](./MEDIA.md) · [Backend CONTENT_CREATION_GUIDE](../My-Verse-Backend/docs/CONTENT_CREATION_GUIDE.md) · [Postman](../My-Verse-Backend/postman/README.md)

---

## Overview

- **Consumer:** browse published projects on the Projects tab, tap to open detail.
- **Admin:** create books and photoshoots via FAB on Projects tab; preview drafts on Admin tab.
- **Permission:** `canManageProjects()` — ADMIN only for create FAB and create routes.

**Visibility:** Admin JWT sees all non-deleted projects and all sections (including drafts). Staff and guests see published projects and published sections only (backend-enforced; frontend sends JWT when logged in).

---

## Section picker (Book + Photoshoot)

Project detail uses a **section selector** — like picking a season on a streaming app:

- Default: first section by `sortOrder`
- Multiple sections: tap trigger → bottom sheet list (same pattern as create FAB)
- Single section: static label (no picker)
- Admin preview: draft sections show a status badge in the sheet

**Book:** selected section content scrolls vertically (TEXT items).

**Photoshoot:** selected section shows a **horizontal image pager** — swipe left/right within the section; counter `2 / 8`; **tap a photo** to open the fullscreen viewer (swipe or prev/next, close with X). Empty section shows “No photos in this session.” V1 does not auto-advance to the next section at the last photo.

---

## Admin flow — create book

1. Log in as **ADMIN**
2. Open **Projects** tab → tap **+** FAB → **Book**
3. Complete the 4-step wizard (`admin/create-book`):
   - **Book** — title (required), description, summary
   - **Section** — label (required), optional description
   - **Content** — text body (required)
   - **Publish** — review → publish section → publish project
4. Land on project detail (reader view)

## Admin flow — create photoshoot

1. Log in as **ADMIN**
2. Open **Projects** tab → tap **+** FAB → **Photoshoot**
3. Complete the 4-step wizard (`admin/create-photoshoot`):
   - **Photoshoot** — title (required), description, theme, location
   - **Section** — label (required), optional description
   - **Photos** — pick one or more images; each upload becomes an IMAGE section item
   - **Publish** — review → publish section → publish project
4. Land on project detail (gallery viewer)

## Admin flow — manage drafts

1. Open **Admin** tab
2. View all projects (including drafts) with status badges
3. Tap a project to open detail / preview (draft sections visible with badges)

The Admin tab does **not** host the create FAB — creation lives on the Projects tab.

## Consumer flow

1. Open **Projects** tab (guest or logged in)
2. Tap a published project card
3. On `/project/[id]`:
   - **Book:** pick section (if multiple) → read text
   - **Photoshoot:** pick section → swipe inline photos → tap for fullscreen gallery

Draft projects are visible to admin in the Admin tab but hidden from the public list until published.

---

## API sequence (book create)

```
POST /projects                    { type: BOOK, title, bookDetails? }
POST /projects/:id/sections       { label, description? }
POST /projects/:id/sections/:sid/items   { kind: TEXT, textContent }
POST /projects/:id/sections/:sid/publish
POST /projects/:id/publish
```

## API sequence (photoshoot create)

```
POST /projects                    { type: PHOTOSHOOT, title, photoshootDetails? }
POST /projects/:id/sections       { label, description? }
POST /media/upload/image          (per photo)
POST /projects/:id/sections/:sid/items   { kind: IMAGE, file }  (one per photo)
POST /projects/:id/sections/:sid/publish
POST /projects/:id/publish
```

**Publish order:** section first, then project (two-level publish).

---

## Frontend routes

| Route | Purpose |
|-------|---------|
| `(tabs)/index` | Public published project list + admin create FAB |
| `(tabs)/admin` | Admin draft list with status badges |
| `admin/create-book` | 4-step book wizard |
| `admin/create-photoshoot` | 4-step photoshoot wizard |
| `project/[id]` | Reader / gallery detail with section picker |

## Key files

| File | Role |
|------|------|
| `src/components/projects/project-create-fab.tsx` | Admin-only FAB on Projects tab |
| `src/components/ui/create-fab.tsx` | FAB + option sheet |
| `src/components/ui/option-sheet.tsx` | Reusable bottom-sheet picker |
| `src/components/projects/section-picker.tsx` | Section selector trigger + sheet |
| `src/components/admin/create-book-wizard.tsx` | Book create wizard |
| `src/components/admin/create-photoshoot-wizard.tsx` | Photoshoot create wizard |
| `src/components/projects/project-detail-header.tsx` | Title, type, book/photoshoot meta |
| `src/components/projects/book-section-content.tsx` | Vertical TEXT for selected section |
| `src/components/projects/photoshoot-section-content.tsx` | Horizontal IMAGE pager + tap → fullscreen |
| `src/hooks/use-projects.ts` | Project list |
| `src/hooks/use-project.ts` | Single project detail |
| `src/hooks/use-selected-section.ts` | Selected section state |
| `src/lib/permissions.ts` | `canManageProjects()` |

## Manual test checklist

1. Admin → + FAB → Book → publish → section picker + chapter text
2. Admin → + FAB → Photoshoot → add 2+ photos → publish → inline swipe + tap for fullscreen
3. Log out → published book/photoshoot appear → detail works for guests
4. Draft project: Admin tab only before publish; guest gets 404 or empty on detail
5. Admin preview: draft section badge in section picker; guest does not see draft sections
6. Photoshoot empty section: “No photos in this session”
7. Book empty section: “No content in this chapter”
8. Non-admin: no create FAB; `/admin/create-photoshoot` shows access denied

## Prerequisites

- `EXPO_PUBLIC_API_URL` in `.env`
- Backend `CORS_ORIGINS` includes `http://localhost:8081` for web dev
- Admin account (backend seeder or existing admin user)
