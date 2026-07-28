# In-App Notification Demo

Small workspace for a demo frontend and its BFF/backend integration.

The old reusable package flow has been removed. The frontend talks only to
local Next.js API routes, and those routes call the DokaAI notification
services through backend modules.

## Structure

- `backend/`
  - backend/BFF modules
  - customer JWT signing
  - notification/preference API integrations
- `frontend/`
  - standalone Next.js frontend
  - screen state, dashboard, preferences, socket status

## Flow

```txt
Frontend form
  -> /api/auth/customer-token
    -> backend signs the customer JWT
      -> frontend receives the bearer token

Frontend screens
  -> /api/notifications and /api/preferences routes
    -> backend attaches Authorization: Bearer <token>
      -> DokaAI APIs

Frontend socket UI
  -> direct Socket.IO connection
    -> uses Bearer token for socket auth
```

## Local App

Run the frontend from `frontend/`:

```bash
npm run dev
```

Required environment variables:

- `NUDGE_SERVICE_API_URL`
- `NEXT_PUBLIC_WSS_SERVICE_API_URL` - accepts either a socket host such as `https://example.com` or a mounted Socket.IO endpoint such as `https://example.com/realtime/socket.io`
