# MyVerse Frontend Documentation

Documentation for the MyVerse Expo app (web, iOS, Android).

## Index

| Document | Description |
|----------|-------------|
| [AUTH.md](./AUTH.md) | Login, logout, session persistence, navigation permissions |

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

Android emulator (host machine): `http://10.0.2.2:3000/api/v1`
