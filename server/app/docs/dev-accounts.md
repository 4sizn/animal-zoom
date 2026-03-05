# Dev Accounts

WARNING: These credentials are for local development only. Do not use in production.

## Accounts (always seeded)

These 3 accounts are always ensured by the seed script (defaults always included), even if
`DEV_SEED_USERS_JSON` is set:

- `dev1@animal-zoom.local` / `password123!`
- `dev2@animal-zoom.local` / `password123!`
- `admin@animal-zoom.local` / `password123!`

## Adding extra users (DEV_SEED_USERS_JSON)

`DEV_SEED_USERS_JSON` is an optional JSON array of `{ "email", "password" }` that adds extra
users on top of the defaults (it does not replace them). Duplicate emails are ignored.

```env
DEV_SEED_USERS_JSON='[{"email":"extra@animal-zoom.local","password":"password123!"}]'
```

This is intended for local development only. Do not enable in production.
