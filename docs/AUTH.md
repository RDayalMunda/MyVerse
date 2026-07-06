# Authentication (Frontend)

> Login, logout, and session handling for the MyVerse Expo app.

## Overview

- **State:** Zustand store with `persist` middleware
- **Storage:** `@react-native-async-storage/async-storage`
- **API:** My-Verse-Backend at `EXPO_PUBLIC_API_URL` (default `https://redvalky.in/api/v1`)

## Session data

The auth store (`src/stores/auth-store.ts`) persists:

| Field | Description |
|-------|-------------|
| `accessToken` | JWT from `POST /auth/login` |
| `user` | User snapshot from login or `GET /auth/me` |

Ephemeral fields (not persisted): `isHydrated`, `isLoading`.

## Login flow

1. User opens `/login` (modal from header **Log in** button)
2. Client validates email format and password length (min 8)
3. `POST /auth/login` with `{ email, password }`
4. On success: store token + user, navigate to `/(tabs)` (Projects)
5. On failure:

| HTTP | Message shown |
|------|---------------|
| 401 | Invalid email or password |
| 403 | Account deactivated |
| Network | Unable to reach server |

## Public registration flow

1. Guest opens `/login` → **Create account** (or navigate directly to `/register`)
2. **Account** step — email, username, password, optional display name
3. **Photo** step — optional profile photo via `POST /media/upload`
4. `POST /auth/register` → creates `PUBLIC` role user
5. On success: `registerPublic` in auth store → logged in on Projects tab
6. Signed-in users are redirected away from `/register`

Duplicate email/username returns a friendly 409 message.

## Logout flow

1. User opens their profile screen (header avatar/name → `/profile` for admin/public; staff → `/staff/:id` or `/staff/edit`)
2. User taps **Log out** at the bottom of the profile screen
3. A confirmation dialog asks **Are you sure you want to log out?**
4. On confirm: auth store clears `accessToken` and `user`
5. User remains on the public Projects tab (login is optional)

## Header (signed in)

The tab header (`src/components/navigation/auth-header.tsx`) shows:

- **Profile photo** when `user.profilePicture` is set
- **Initials placeholder** otherwise (from display name, or username if no display name)
- **Display name** and **role**
- Tap **avatar or name** → profile screen (`/profile` for admin/public; staff → own staff profile)

Header right padding (`paddingRight: 16`) is set in `src/app/(tabs)/_layout.tsx` so the **Log in** button is not flush against the screen edge.

Avatar helper: `src/components/user/user-avatar.tsx` · initials logic: `src/lib/user-display.ts` · route helper: `src/lib/profile-navigation.ts`

## Profile screen

| Role | Header tap destination | Log out | 18+ content |
|------|------------------------|---------|-------------|
| **ADMIN** / **PUBLIC** | `/profile` — display name, photo, username, email | Bottom of profile screen | Toggle on profile; save refreshes project list |

**Save feedback:** Saving profile changes shows a success toast ("Profile saved") and stays on the page. See [UX.md](./UX.md).
| **STAFF** | `/staff/:id` when profile exists, else `/staff/edit` | Bottom of own staff profile or edit screen | Toggle on `/staff/edit`; save refreshes project list |

## App launch / persistence

1. Zustand rehydrates token + user from AsyncStorage
2. If token exists, `GET /auth/me` refreshes the user profile
3. On 401 from `/auth/me`, session is cleared silently
4. Root layout shows a loading spinner until `isHydrated` is true

## Navigation permissions

Tabs in `src/app/(tabs)/_layout.tsx`:

| Tab | Visibility |
|-----|------------|
| **Projects** | Always (default home) |
| **Staff** | Logged-in `ADMIN` or `STAFF` only |
| **Users** | Logged-in `ADMIN` only |

Guests can self-register via **Log in → Create account** (`/register`) or **Join as staff** (`/staff/register`).

Direct navigation to `/users` without admin role shows an inline access-denied placeholder.

Permission helpers live in `src/lib/permissions.ts` and mirror backend role rules.

## Key files

| File | Role |
|------|------|
| `src/components/navigation/auth-header.tsx` | Login button (guest) / user badge (signed in) |
| `src/components/auth/login-form.tsx` | Sign-in form; links to register and staff join |
| `src/components/auth/public-register-wizard.tsx` | Public account registration wizard |
| `src/components/auth/logout-button.tsx` | Log out button with confirmation dialog |
| `src/components/user/user-avatar.tsx` | Profile photo or initials avatar |
| `src/lib/user-display.ts` | Display name + initials helpers |
| `src/lib/profile-navigation.ts` | Profile route by role |
| `src/app/login.tsx` | Sign-in modal screen |
| `src/app/register.tsx` | Create account modal screen |
| `src/app/profile.tsx` | Account profile for admin/public users (incl. nsfw toggle) |
| `src/stores/auth-store.ts` | Session persistence; `login`, `registerPublic`, `registerStaff` |
| `src/api/auth.api.ts` | Login, register, me |
| `src/api/client.ts` | JWT attachment + 401 logout |

## Manual test checklist

1. Guest header shows **Log in** only (with right padding, not flush to edge)
2. Signed-in user with profile photo → avatar image in header
3. Signed-in user without photo → initials placeholder (e.g. **Admin** → `A`, **John Doe** → `JD`)
4. Tap header avatar/name → opens profile (admin → `/profile`; staff → staff profile)
5. **Log out** on profile screen → confirm dialog → cancel stays signed in
6. **Log out** → confirm → session cleared, Projects tab remains
7. Staff: **Log out** on own `/staff/:id` and `/staff/edit`; not shown when admin views another staff profile
8. Guest → **Create account** → completes wizard → logged in as PUBLIC on Projects tab
9. Duplicate email on register → friendly error message
10. Signed-in user opening `/register` → redirected to Projects tab
11. Profile → enable **Show 18+ content** → save → adult projects appear on Projects tab after refocus

## API client

`src/api/client.ts` attaches `Authorization: Bearer <token>` when a session exists. A 401 on authenticated requests triggers automatic logout.

## Staff self-registration

Staff can register via `POST /auth/register/staff` (see [STAFF.md](./STAFF.md)).

1. Client uploads profile photo via `POST /media/upload`
2. Client calls `POST /auth/register/staff` with account + profile + `profilePicture`
3. On success: `registerStaff` in auth store calls `setSession(accessToken, user)` — same persistence as login
4. User is logged in as `STAFF` with JWT in AsyncStorage

## Public self-registration

Public users register via `POST /auth/register`:

1. Optional profile photo via `POST /media/upload`
2. `POST /auth/register` with `{ email, username, password, displayName?, profilePicture? }`
3. On success: `registerPublic` in auth store → `PUBLIC` role session

## Profile preferences (18+ content)

`PATCH /users/me` with `{ nsfwEnabled: true }` from `/profile`. Required for non-admins to view projects with `isAdult: true`. Saving toggles `invalidateProjectsList()` so the Projects tab refetches on focus.

## Related backend docs

- [My-Verse-Backend/docs/AUTH.md](../../My-Verse-Backend/docs/AUTH.md)
