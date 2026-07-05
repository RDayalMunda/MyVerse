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
| **6** | Unpublish, edit, reorder, visibility/NSFW UI | Partial — unpublish + delete on project detail |

## Postman module checklist

| Module | Read | Write (Admin) | Frontend status |
|--------|------|---------------|-----------------|
| Health | - | - | Not started |
| Auth | Partial | Staff register | Login/logout + staff register |
| Users | - | Create staff, update, activate/deactivate | Partial (staff admin flows) |
| Staff | List + detail | Self-register, admin create, self-edit | Done — [STAFF.md](./STAFF.md) |
| Media | - | Profile + project image upload | Done — [MEDIA.md](./MEDIA.md) |
| Projects | List + detail | Create book/photoshoot, publish, unpublish, delete | Partial — [PROJECT.md](./PROJECT.md) |
| Sections | Detail | Create, publish | Done |
| Section Items | Detail | TEXT + IMAGE create | Done |

See [PROJECT.md](./PROJECT.md) for the projects module. [STAFF.md](./STAFF.md) covers the staff module.
