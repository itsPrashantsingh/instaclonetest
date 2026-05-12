# Instagram Style Mobile Clone

This project has:
- React frontend (mobile-first Instagram style UI)
- Node + Express backend
- MongoDB data layer

## Behavior

- Any visitor logs in with `loginId` and `password`
- Passwords are matched from MongoDB in plain text (as requested)
- After login, everyone is redirected to one fixed profile feed: `yourprofile`
- Feed is scrollable and mobile-focused

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start backend:

```bash
npm run dev:backend
```

3. Start frontend in a new terminal:

```bash
npm run dev
```

4. Seed initial data:

```bash
curl -X POST http://localhost:5001/api/seed
```

## Environment

Backend uses:
- `MONGO_URI` (default: `mongodb://127.0.0.1:27017/insta_clone`)
- `PORT` (default: `5001`)

Frontend uses:
- `VITE_API_URL` (default: `http://localhost:5001`)

## Default Visitor Logins (seed)

- `guest1 / guest123`
- `guest2 / guest123`
