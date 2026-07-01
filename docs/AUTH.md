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

1. User taps **Log out** in tab header
2. Auth store clears `accessToken` and `user`
3. User remains on public Projects tab (login is optional)

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
| **Staff** | Always (public API) |
| **Users** | Logged-in `ADMIN` only |

Direct navigation to `/users` without admin role shows an inline access-denied placeholder.

Permission helpers live in `src/lib/permissions.ts` and mirror backend role rules.

## API client

`src/api/client.ts` attaches `Authorization: Bearer <token>` when a session exists. A 401 on authenticated requests triggers automatic logout.

## Related backend docs

- [My-Verse-Backend/docs/AUTH.md](../../My-Verse-Backend/docs/AUTH.md)
