# Projects Module (Frontend)

> Admin creates a BOOK with one section and one TEXT item, publishes both; any user reads it on the project detail screen.

**Related:** [ROADMAP.md](./ROADMAP.md) · [AUTH.md](./AUTH.md) · [Backend CONTENT_CREATION_GUIDE](../My-Verse-Backend/docs/CONTENT_CREATION_GUIDE.md) · [Postman](../My-Verse-Backend/postman/README.md)

---

## Overview

- **Consumer:** browse published projects on the Projects tab, tap to read detail.
- **Admin:** create books via FAB on Projects tab; manage drafts on Admin tab.
- **Permission:** `canManageProjects()` — ADMIN only for create FAB and create route.

## Admin flow — create book

1. Log in as **ADMIN**
2. Open **Projects** tab → tap **+** FAB → **Book**
3. Complete the 4-step wizard (`admin/create-book`):
   - **Book** — title (required), description, summary
   - **Section** — label (required), optional description
   - **Content** — text body (required)
   - **Publish** — review → publish section → publish project
4. Land on project detail screen (reader view)

## Admin flow — manage drafts

1. Open **Admin** tab
2. View all projects (including drafts) with status badges
3. Tap a project to open detail / preview

The Admin tab does **not** host the create FAB — creation lives on the Projects tab.

## Consumer flow

1. Open **Projects** tab (guest or logged in)
2. Tap a published book card
3. Read section label and text content on `/project/[id]`

Draft projects are visible to admin in the Admin tab (status badge) but hidden from the public list until published.

## API sequence (book create)

```
POST /projects                    { type: BOOK, title, bookDetails? }
POST /projects/:id/sections       { label, description? }
POST /projects/:id/sections/:sid/items   { kind: TEXT, textContent }
POST /projects/:id/sections/:sid/publish
POST /projects/:id/publish
```

**Publish order:** section first, then project (two-level publish).

## Frontend routes

| Route | Purpose |
|-------|---------|
| `(tabs)/index` | Public published project list + admin create FAB |
| `(tabs)/admin` | Admin draft list with status badges |
| `admin/create-book` | 4-step book wizard |
| `project/[id]` | Reader / preview detail |

## Key files

| File | Role |
|------|------|
| `src/components/projects/project-create-fab.tsx` | Admin-only FAB on Projects tab |
| `src/components/ui/create-fab.tsx` | Reusable FAB + bottom sheet |
| `src/components/admin/create-book-wizard.tsx` | 4-step wizard |
| `src/hooks/use-projects.ts` | Public project list |
| `src/hooks/use-project.ts` | Single project detail |
| `src/lib/permissions.ts` | `canManageProjects()` |

## Manual test checklist

1. Admin login → Projects tab → + FAB → Book → publish → see detail with text
2. Log out → Projects tab → book appears → open detail → same text
3. Before publish: draft visible in Admin tab only, not in public Projects list
4. Non-admin: no Admin tab; no create FAB; direct URL to create-book shows access denied

## Prerequisites

- `EXPO_PUBLIC_API_URL` in `.env`
- Backend `CORS_ORIGINS` includes `http://localhost:8081` for web dev
- Admin account (backend seeder or existing admin user)
