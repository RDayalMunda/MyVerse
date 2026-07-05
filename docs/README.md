# MyVerse Frontend Documentation

Documentation for the MyVerse Expo app (web, iOS, Android).

## Index

| Document | Description |
|----------|-------------|
| [DOCS.md](./DOCS.md) | Documentation conventions and maintenance workflow |
| [ROADMAP.md](./ROADMAP.md) | Module-wise integration plan and slice status |
| [AUTH.md](./AUTH.md) | Login, logout, session persistence, navigation permissions |
| [PROJECT.md](./PROJECT.md) | Projects — list, detail, admin create, drafts |
| [STAFF.md](./STAFF.md) | Staff directory, registration, profile management |
| [MEDIA.md](./MEDIA.md) | Profile image upload |
| [BUILD_ANDROID.md](./BUILD_ANDROID.md) | Local release APK build (Android) |

## Backend

The API is provided by [My-Verse-Backend](../My-Verse-Backend). See backend docs for full API reference:

- `My-Verse-Backend/docs/AUTH.md`
- `My-Verse-Backend/docs/PROJECT_PLAN.md`
- `My-Verse-Backend/docs/PROJECTS.md`

## Environment

Copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_API_URL=https://redvalky.in/api/v1
```

For local development:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

The app rewrites `localhost` automatically for native dev:

| Platform | Resolved host |
|----------|----------------|
| Web | `localhost` (unchanged) |
| Android emulator | `10.0.2.2` |
| Physical device (Expo Go) | Your machine's LAN IP (from Metro, e.g. `192.168.x.x`) |

Android emulator manual override: `http://10.0.2.2:3000/api/v1`

## Release APK (Android)

**First time?** Read [BUILD_ANDROID.md](./BUILD_ANDROID.md) — steps 1–5 (JDK, Android SDK, keystore, `.env.production`) **before** `npm run build:apk:setup`.

```bash
npm run build:apk:setup   # step 6 — save machine paths
npm run build:apk         # step 7 — build → dist/myverse-*.apk
```
