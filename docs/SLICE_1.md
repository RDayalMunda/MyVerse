# Slice 1 — Book Pipeline + Consumer Detail

> Admin creates a BOOK with one section and one TEXT item, publishes both, then any user reads it on the project detail screen.

**Related:** [ROADMAP.md](./ROADMAP.md) · [AUTH.md](./AUTH.md) · [Backend CONTENT_CREATION_GUIDE](../My-Verse-Backend/docs/CONTENT_CREATION_GUIDE.md) · [Postman](../My-Verse-Backend/postman/README.md)

---

## Admin flow

1. Log in as **ADMIN**
2. Open **Admin** tab → **New Book**
3. Complete the 4-step wizard:
   - **Book** — title (required), description, summary
   - **Section** — label (required), optional description
   - **Content** — text body (required)
   - **Publish** — review → publish section → publish project
4. Land on project detail screen (reader view)

## API sequence

```
POST /projects                    { type: BOOK, title, bookDetails? }
POST /projects/:id/sections       { label, description? }
POST /projects/:id/sections/:sid/items   { kind: TEXT, textContent }
POST /projects/:id/sections/:sid/publish
POST /projects/:id/publish
```

**Publish order:** section first, then project (two-level publish).

## Consumer flow

1. Open **Projects** tab (guest or logged in)
2. Tap a published book card
3. Read section label and text content on `/project/[id]`

Draft projects are visible to admin in the Admin tab (status badge) but hidden from the public list until published.

## Frontend routes

| Route | Purpose |
|-------|---------|
| `(tabs)/admin` | Admin project list + New Book |
| `admin/create-book` | 4-step wizard |
| `project/[id]` | Reader / preview detail |

## Manual test checklist

1. Admin login → Admin tab → New Book → publish → see detail with text
2. Log out → Projects tab → book appears → open detail → same text
3. Before publish: draft visible in Admin tab only, not in public Projects list
4. Non-admin: no Admin tab; direct URL to create-book shows access denied

## Prerequisites

- `EXPO_PUBLIC_API_URL` in `.env`
- Backend `CORS_ORIGINS` includes `http://localhost:8081` for web dev
- Admin account (backend seeder or existing admin user)
