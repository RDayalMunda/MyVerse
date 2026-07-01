# MyVerse Frontend Roadmap

Module-wise integration plan aligned with [My-Verse-Backend Postman](../My-Verse-Backend/postman/README.md).

## Slices

| Slice | Scope | Status |
|-------|--------|--------|
| **0** | Login, logout, session, tab navigation | Done |
| **1** | Admin: create BOOK + TEXT, publish; consumer project detail | Done |
| **2** | Photoshoot + image upload + IMAGE items | Planned |
| **3** | Show + video upload + VIDEO items | Planned |
| **4** | Staff CRUD: read, self-register, admin create, self-edit, deactivate | Done |
| **5** | Users admin CRUD | Planned |
| **6** | Unpublish, edit, reorder, visibility/NSFW UI | Planned |

## Postman module checklist

| Module | Read | Write (Admin) | Frontend status |
|--------|------|---------------|-----------------|
| Health | - | - | Not started |
| Auth | Partial | Staff register | Login/logout + staff register |
| Users | - | Create staff, update, activate/deactivate | Partial (staff admin flows) |
| Staff | List + detail | Self-register, admin create, self-edit | Done — [STAFF.md](./STAFF.md) |
| Media | - | Profile upload | Done — [MEDIA.md](./MEDIA.md) |
| Projects | List + detail | Create book, publish | Done — [PROJECT.md](./PROJECT.md) |
| Sections | Detail | Create, publish | Slice 1 |
| Section Items | Detail | TEXT create | Slice 1 |

See [PROJECT.md](./PROJECT.md) for the projects module. [STAFF.md](./STAFF.md) covers the staff module.
