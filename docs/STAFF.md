# Staff Module (Frontend)

> Staff directory, self-registration, admin create, profile self-edit, and account deactivate.

**Related:** [ROADMAP.md](./ROADMAP.md) · [AUTH.md](./AUTH.md) · [MEDIA.md](./MEDIA.md) · [Backend REGISTRATION.md](../My-Verse-Backend/docs/REGISTRATION.md) · [Postman Staff/Users](../My-Verse-Backend/postman/README.md)

---

## Overview

Staff CRUD spans several backend resources — not a single `/staff` CRUD API:

| Operation | Who | API |
|-----------|-----|-----|
| List / detail | ADMIN, STAFF (JWT required) | `GET /staff`, `GET /staff/:id` |
| Self-register | Guest | `POST /auth/register/staff` |
| Admin create | ADMIN | `POST /users` (role STAFF) |
| Edit profile body | STAFF (own) | `PATCH /staff/me` |
| Edit profile photo | STAFF (own) | `PATCH /users/me` |
| Edit account fields | ADMIN | `PATCH /users/:id` |
| Deactivate / activate | ADMIN | `PATCH /users/:id/deactivate`, `/activate` |

**Not available:** `PATCH /staff/:id` for admin — staff profile body is editable only by the logged-in staff member.

**Delete:** Deactivate only; no hard delete in backend v1.

Only **complete** profiles (`isProfileComplete: true`) appear in `GET /staff`.

**Frontend auth:** `listStaffApi` and `getStaffApi` attach the session JWT automatically (do not pass `token: null`). Unauthenticated requests receive "Invalid or missing token" from the backend.

---

## Profile photo preview

Tap a staff avatar on the **directory card** or **profile detail** hero to open the fullscreen image viewer (swipe not applicable for single photo; close with X).

---

## Create flows

### Self-register (public)

1. Open **Log in** → **Join as staff** (or navigate to `/staff/register`)
2. 4-step wizard at `/staff/register`:
   - Account — email, username, password, displayName
   - Photo — `POST /media/upload` (required)
   - Profile — gender-conditional fields
   - Review → `POST /auth/register/staff`
3. On success: session stored via auth store (`setSession`), navigate to Staff tab

### Admin create

1. ADMIN → Staff tab → **+** FAB → **Create staff**
2. Same wizard shape at `/staff/create` → `POST /users` with `role: 'STAFF'`

---

## Update flows

### Staff self-service

Route: `/staff/edit` (STAFF role only)

- Profile fields → `PATCH /staff/me`
- Photo → upload then `PATCH /users/me`
- **Date of birth:** native date picker (mobile) or browser date input (web). Form stores `YYYY-MM-DD`; API may return full ISO (`1997-11-30T00:00:00.000Z`). PATCH body sends date-only (`1997-11-30`).
- **Likes / skills:** chip inputs — type a value and press Enter to add; tap × to remove. Stored as string arrays.
- **Save flow:** full-page loader while saving → navigate to `/staff/:id` (own profile detail) with fresh data; header back returns to the previous screen.

**Edit profile** button on staff detail when `auth.user.id === profile.userId`.

Staff tab empty state **Edit your profile** opens your profile detail first (when `staffProfile.id` is known), then edit from there — consistent back navigation.

### Admin account management

On staff detail (`/staff/[id]`) when ADMIN:

- **Edit account** → `/staff/[id]/edit-account` → `PATCH /users/:userId`
- **Deactivate / Activate** → `PATCH /users/:id/deactivate` or `/activate`

No UI for admin to edit stageName, bio, or body measurements.

---

## Gender-conditional fields

| Gender | Extra required fields |
|--------|----------------------|
| All | gender, heightCm, weightG, likes (array, may be empty) |
| FEMALE | chestCm, waistCm, hipsCm, cupSize (1–4 chars) |
| MALE | lengthLimpMm, lengthErectMm, girthMm, loadCapacityMl |
| PREFER_NOT_TO_DISCLOSE | Common fields only |

Self-register also requires stageName, bio, displayName, profilePicture.

Client validation: `src/lib/staff-validation.ts`

---

## Frontend routes

| Route | Purpose |
|-------|---------|
| `(tabs)/staff` | Paginated directory (ADMIN/STAFF JWT) + StaffCreateFab |
| `staff/[id]` | Profile detail (ADMIN/STAFF JWT) |
| `staff/register` | Self-register wizard |
| `staff/create` | Admin create wizard |
| `staff/edit` | Staff self-edit |
| `staff/[id]/edit-account` | Admin account fields |

## Key files

| File | Role |
|------|------|
| `src/api/staff.api.ts` | List, get (JWT), PATCH /staff/me |
| `src/api/users.api.ts` | Admin create, update, activate/deactivate |
| `src/api/auth.api.ts` | registerStaffApi |
| `src/components/staff/staff-create-fab.tsx` | FAB on Staff tab |
| `src/components/staff/staff-profile-fields.tsx` | Shared profile form |
| `src/components/ui/date-of-birth-field.tsx` | Date picker (web + native) |
| `src/components/ui/chip-input-field.tsx` | Likes/skills chip input |
| `src/components/staff/tag-chip-list.tsx` | Read-only chips on detail |
| `src/lib/date-format.ts` | ISO ↔ form date normalization |
| `src/components/staff/staff-register-wizard.tsx` | Public register |
| `src/components/staff/staff-admin-create-wizard.tsx` | Admin create |
| `src/components/staff/staff-card.tsx` | Directory card; avatar tap → fullscreen viewer |
| `src/app/staff/[id].tsx` | Detail; hero avatar tap → fullscreen viewer |
| `src/lib/permissions.ts` | Role helpers |
| `src/components/media/fullscreen-image-viewer.tsx` | Shared fullscreen gallery modal |

## Permissions matrix

| Action | Guest | PUBLIC | STAFF | ADMIN |
|--------|-------|--------|-------|-------|
| View directory / detail | — | — | Yes | Yes |
| Join as staff | Yes | — | — | Yes |
| Create staff (admin) | — | — | — | Yes |
| Edit own profile | — | — | Yes | — |
| Edit account / deactivate | — | — | — | Yes |

---

## Manual test checklist

1. Login as ADMIN or STAFF → Staff tab loads list; detail opens without token errors
2. Staff tab lists complete profiles; tap avatar on card or detail for fullscreen photo
3. Upload profile photo on web + native; image renders via `mediaUrl()`
4. Guest completes register wizard → logged in as STAFF
5. Admin creates staff via FAB → appears in directory when profile complete
6. Staff updates bio via Edit profile → full-page save loader → lands on detail with fresh chips and date of birth
7. Admin deactivates staff → login blocked; activate restores access
8. Non-admin cannot open `/staff/create`; non-staff cannot open `/staff/edit`
9. Guest / logged-out user does not see Staff tab

## Prerequisites

- `EXPO_PUBLIC_API_URL` in `.env`
- Backend `CORS_ORIGINS` includes `http://localhost:8081` for web dev
- Profile complete requires photo + stageName + bio + gender body rules

## Known backend gaps

- Admin cannot edit another user's staff profile body (`PATCH /staff/:id` does not exist)
- Hard delete not supported
