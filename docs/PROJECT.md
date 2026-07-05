# Projects Module (Frontend)

> Admin creates BOOK and PHOTOSHOOT projects, publishes them; consumers read on the project detail screen with a shared section picker (Netflix-style “season” selector).

**Related:** [ROADMAP.md](./ROADMAP.md) · [AUTH.md](./AUTH.md) · [MEDIA.md](./MEDIA.md) · [Backend CONTENT_CREATION_GUIDE](../My-Verse-Backend/docs/CONTENT_CREATION_GUIDE.md) · [Postman](../My-Verse-Backend/postman/README.md)

---

## Overview

- **Consumer:** browse published projects on the Projects tab, tap to open detail.
- **Admin:** create books and photoshoots via FAB; edit projects/sections/items from project detail **Manage project**; preview drafts on Admin tab; unpublish or delete projects from project detail.
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

## Admin flow — manage existing project

1. Open **project detail** as admin → tap **Manage project**
2. On the manage hub (`/project/[id]/manage`):
   - **Edit project details** — title, description, book summary or photoshoot theme/location
   - **Manage sections** — list, reorder, add, edit, publish/unpublish, delete
   - **Publish project** — when status is `DRAFT` or `UNPUBLISHED`
3. From **Edit section** → **Manage items**:
   - **Book:** add/edit/delete TEXT items, reorder
   - **Photoshoot:** add/replace/delete IMAGE items, reorder (max 120 photos per section)

Destructive **unpublish/delete project** actions stay on project detail (not duplicated on the manage hub).

## Admin flow — manage drafts

1. Open **Admin** tab
2. View all projects (including drafts) with status badges
3. Tap a project to open detail / preview (draft sections visible with badges)

The Admin tab does **not** host the create FAB — creation lives on the Projects tab.

## Admin flow — unpublish and delete

On **project detail** (`/project/[id]`), admins see two separate actions below the header:

| Action | When shown | API | Confirmation |
|--------|------------|-----|----------------|
| **Unpublish project** | `status === PUBLISHED` | `POST /projects/:id/unpublish` | Confirm dialog: hides from public catalog; sections keep statuses |
| **Delete project** | `status !== DELETED` | `DELETE /projects/:id` (soft) or `DELETE /projects/:id/permanent` | Confirm dialog with **Delete** (soft) and **Delete permanently** (second confirm) |

- **Unpublish** — sets `UNPUBLISHED`; content stays in the database; public list hides the project.
- **Soft delete** — sets `DELETED`; removed from normal admin/public lists; sections, items, and media remain.
- **Permanent delete** — irreversible; removes project tree and unreferenced media (see backend [CONTENT_CREATION_GUIDE](../My-Verse-Backend/docs/CONTENT_CREATION_GUIDE.md)).

After soft or permanent delete, the app navigates back. After unpublish, the detail screen refreshes and shows the updated status badge.

**List refresh:** Mutations call `invalidateProjectsList()`; project list tabs refetch silently when they regain focus (no refetch on browser tab switch or app resume unless data changed). See `stores/list-invalidation-store.ts` and `hooks/use-stale-list-refetch.ts`.

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

## API sequence (admin edit)

```
PATCH /projects/:id                         — update title, description, type extension
POST  /projects/:id/sections                — create section
PATCH /projects/:id/sections/:sid           — update section label/description
PATCH /projects/:id/sections/reorder        — { sectionIds: [...] }
POST  /projects/:id/sections/:sid/publish
POST  /projects/:id/sections/:sid/unpublish
DELETE /projects/:id/sections/:sid
POST  /projects/:id/sections/:sid/items     — TEXT or IMAGE create
PATCH /projects/:id/sections/:sid/items/:iid — update text, label, or replace image
PATCH /projects/:id/sections/:sid/items/reorder — { itemIds: [...] }
DELETE /projects/:id/sections/:sid/items/:iid
POST  /media/upload/image                   — before IMAGE create or replace
```

## API sequence (admin lifecycle)

```
POST /projects/:id/unpublish          — hide from public (PUBLISHED → UNPUBLISHED)
DELETE /projects/:id                  — soft delete (status → DELETED)
DELETE /projects/:id/permanent        — irreversible remove project + content
```

---

## Frontend routes

| Route | Purpose |
|-------|---------|
| `(tabs)/index` | Public published project list + admin create FAB |
| `(tabs)/admin` | Admin draft list with status badges |
| `admin/create-book` | 4-step book wizard |
| `admin/create-photoshoot` | 4-step photoshoot wizard |
| `project/[id]` | Reader / gallery detail; admin manage, unpublish, delete |
| `project/[id]/manage` | Admin manage hub |
| `project/[id]/edit` | Edit project metadata |
| `project/[id]/sections` | Section list + reorder + add |
| `project/[id]/sections/create` | New section form |
| `project/[id]/sections/[sectionId]/edit` | Edit section + publish lifecycle |
| `project/[id]/sections/[sectionId]/items` | Item list + reorder + add |
| `project/[id]/sections/[sectionId]/items/create` | Add TEXT item (book) |
| `project/[id]/sections/[sectionId]/items/add-photo` | Add IMAGE items (photoshoot) |
| `project/[id]/sections/[sectionId]/items/[itemId]/edit` | Edit TEXT or IMAGE item |

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
| `src/components/projects/project-admin-actions.tsx` | Admin unpublish + delete with confirmations |
| `src/components/ui/confirm-dialog.tsx` | Cross-platform confirm modal (web + native) |
| `src/components/projects/book-section-content.tsx` | Vertical TEXT for selected section |
| `src/components/projects/photoshoot-section-content.tsx` | Horizontal IMAGE pager + tap → fullscreen |
| `src/hooks/use-projects.ts` | Project list |
| `src/hooks/use-stale-list-refetch.ts` | Silent refetch when list marked stale on focus |
| `src/stores/list-invalidation-store.ts` | Stale flags after mutations |
| `src/components/admin/project-book-fields.tsx` | Shared book project form fields |
| `src/components/admin/project-photoshoot-fields.tsx` | Shared photoshoot project form fields |
| `src/components/admin/section-fields.tsx` | Section label + description fields |
| `src/components/admin/text-item-fields.tsx` | TEXT item form fields |
| `src/components/admin/photoshoot-item-picker.tsx` | Image picker for photoshoot items |
| `src/components/admin/project-admin-gate.tsx` | Admin permission gate for manage routes |
| `src/hooks/use-project-on-focus.ts` | Project detail + refetch on screen focus |
| `src/hooks/use-project.ts` | Single project detail fetch |
| `src/hooks/use-selected-section.ts` | Selected section state |
| `src/lib/permissions.ts` | `canManageProjects()` |
| `src/api/projects.api.ts` | List, get, create, update, publish, unpublish, delete |
| `src/api/sections.api.ts` | Section create, update, delete, reorder, publish, unpublish |
| `src/api/section-items.api.ts` | Item create, update, delete, reorder |

## Manual test checklist

1. Admin → + FAB → Book → publish → section picker + chapter text
2. Admin → + FAB → Photoshoot → add 2+ photos → publish → inline swipe + tap for fullscreen
3. Log out → published book/photoshoot appear → detail works for guests
4. Draft project: Admin tab only before publish; guest gets 404 or empty on detail
5. Admin preview: draft section badge in section picker; guest does not see draft sections
6. Photoshoot empty section: “No photos in this session”
7. Book empty section: “No content in this chapter”
8. Non-admin: no create FAB; `/admin/create-photoshoot` shows access denied
9. Admin on published project → Unpublish → confirm → status `UNPUBLISHED`; guest no longer sees it in list
10. Admin → Delete → soft delete → confirm → navigates back; project gone from Admin tab
11. Admin → Delete → Delete permanently → second confirm → navigates back; project irrecoverable
12. Non-admin on project detail: no Unpublish or Delete buttons
13. Delete project → back to list → deleted project no longer shown (without pull-to-refresh)
14. Create/publish project → back to list → new project appears
15. Admin → Manage project → edit book title/summary → detail header updates
16. Admin → Manage sections → add section → publish section on live project
17. Admin → Manage items → add second TEXT block (book) or photo (photoshoot) → reorder → delete
18. Non-admin: `/project/[id]/manage` shows access denied

## Prerequisites

- `EXPO_PUBLIC_API_URL` in `.env`
- Backend `CORS_ORIGINS` includes `http://localhost:8081` for web dev
- Admin account (backend seeder or existing admin user)
