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

## Logout flow

1. User taps **Log out** in the tab header
2. A confirmation dialog asks **Are you sure you want to log out?**
3. On confirm: auth store clears `accessToken` and `user`
4. User remains on the public Projects tab (login is optional)

## Header (signed in)

The tab header (`src/components/navigation/auth-header.tsx`) shows:

- **Profile photo** when `user.profilePicture` is set
- **Initials placeholder** otherwise (from display name, or username if no display name)
- **Display name** and **role** (existing)
- **Log out** button (with confirmation)
- Tap **avatar or name** → profile screen (`/profile` for admin/public; staff → own staff profile)

Avatar helper: `src/components/user/user-avatar.tsx` · initials logic: `src/lib/user-display.ts` · route helper: `src/lib/profile-navigation.ts`

## Profile screen

| Role | Header tap destination |
|------|------------------------|
| **ADMIN** / **PUBLIC** | `/profile` — display name, photo, username, email |
| **STAFF** | `/staff/:id` when profile exists, else `/staff/edit` |

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

Guests can still self-register as staff via **Log in → Join as staff** (`/staff/register`).

Direct navigation to `/users` without admin role shows an inline access-denied placeholder.

Permission helpers live in `src/lib/permissions.ts` and mirror backend role rules.

## Key files

| File | Role |
|------|------|
| `src/components/navigation/auth-header.tsx` | Login / user badge / logout with confirmation |
| `src/components/user/user-avatar.tsx` | Profile photo or initials avatar |
| `src/lib/user-display.ts` | Display name + initials helpers |
| `src/lib/profile-navigation.ts` | Profile route by role |
| `src/app/profile.tsx` | Account profile for admin/public users |
| `src/stores/auth-store.ts` | Session persistence |
| `src/api/client.ts` | JWT attachment + 401 logout |

## Manual test checklist

1. Guest header shows **Log in** only
2. Signed-in user with profile photo → avatar image in header
3. Signed-in user without photo → initials placeholder (e.g. **Admin** → `A`, **John Doe** → `JD`)
4. **Log out** → confirm dialog → cancel stays signed in
5. **Log out** → confirm → session cleared, Projects tab remains
6. Tap header avatar/name → opens profile (admin → `/profile`; staff → staff profile)

## API client

`src/api/client.ts` attaches `Authorization: Bearer <token>` when a session exists. A 401 on authenticated requests triggers automatic logout.

## Staff self-registration

Staff can register via `POST /auth/register/staff` (see [STAFF.md](./STAFF.md)).

1. Client uploads profile photo via `POST /media/upload`
2. Client calls `POST /auth/register/staff` with account + profile + `profilePicture`
3. On success: `registerStaff` in auth store calls `setSession(accessToken, user)` — same persistence as login
4. User is logged in as `STAFF` with JWT in AsyncStorage

## Related backend docs

- [My-Verse-Backend/docs/AUTH.md](../../My-Verse-Backend/docs/AUTH.md)
