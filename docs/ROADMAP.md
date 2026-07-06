# MyVerse Frontend Roadmap

Module-wise integration plan aligned with [My-Verse-Backend Postman](../My-Verse-Backend/postman/README.md).

## Slices

| Slice | Scope | Status |
|-------|--------|--------|
| **0** | Login, logout, session, tab navigation | Done |
| **1** | Admin: create BOOK + TEXT, publish; consumer project detail | Done |
| **2** | Photoshoot + image upload + IMAGE items; section picker + gallery viewer | Done |
| **3** | Show + video upload + VIDEO items | Planned |
| **4** | Staff CRUD: read, self-register, admin create, self-edit, deactivate | Done |
| **5** | Users admin CRUD | Planned |
| **6** | Unpublish, edit, reorder, visibility/NSFW UI | Done |
| **—** | Public registration, list pagination | Done |

## Postman module checklist

| Module | Read | Write (Admin) | Frontend status |
|--------|------|---------------|-----------------|
| Health | - | - | Not started |
| Auth | Partial | Public + staff register | Login/logout, public register, staff register — [AUTH.md](./AUTH.md) |
| Users | - | Create staff, update, activate/deactivate; self `PATCH /users/me` | Partial (staff admin flows + profile nsfw) |
| Staff | List + detail | Self-register, admin create, self-edit | Done — [STAFF.md](./STAFF.md) |
| Media | - | Profile + project image upload | Done — [MEDIA.md](./MEDIA.md) |
| Projects | List + detail | Create, update, publish, unpublish, delete, visibility | Done — [PROJECT.md](./PROJECT.md) |
| Sections | Detail | Create, update, delete, reorder, publish, unpublish | Done |
| Section Items | Detail | TEXT + IMAGE create, update, delete, reorder | Done |

See [PROJECT.md](./PROJECT.md) for the projects module. [STAFF.md](./STAFF.md) covers the staff module.
