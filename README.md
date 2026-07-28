# DokaAI In-App Notification Demo

This repository is a demo app for DokaAI in-app notifications.

It is intentionally simple:

- `frontend/` is the Next.js app users run in the browser.
- `backend/` is the BFF layer used by the frontend API routes.
- There is no reusable SDK/package flow anymore.
- There is no separate backend server to start for this demo.

The frontend talks to local Next.js API routes under `/api/*`. Those routes delegate to handlers in `backend/`, and the backend handlers call the real DokaAI APIs.

## Project Structure

```txt
InApp-Notification-SDK/
  backend/
    apis/        BFF handlers for token, notifications, and preferences
    lib/         backend helpers for env, auth headers, HTTP, and responses
    types.ts     shared backend response/request types

  frontend/
    src/app/     Next.js pages and API route mount files
    src/features UI components, pages, state, and local demo utilities
    src/lib/     frontend API clients and socket client
```

Important detail: files inside `frontend/src/app/api/**/route.ts` are only thin Next.js route mounts. The actual BFF logic lives in `backend/apis/*`.

## Requirements

Install these before running the app:

- Node.js 18 or newer
- npm
- Valid DokaAI customer signing values for login

## Environment Setup

Create a local env file:

```bash
cd frontend
cp .env.example .env.local
```

Then fill in `frontend/.env.local`:

```env
NUDGE_SERVICE_API_URL=https://api.dokaai.com/v1/dokaai
NEXT_PUBLIC_WSS_SERVICE_API_URL=https://wss.dokaai.com/v1/wss
```

### What these env vars mean

`NUDGE_SERVICE_API_URL`

This is the server-side DokaAI REST API base URL. It is used only by the BFF/backend handlers.

`NEXT_PUBLIC_WSS_SERVICE_API_URL`

This is the public Socket.IO service URL used by the browser for live in-app notifications.

The socket client accepts both styles:

```env
NEXT_PUBLIC_WSS_SERVICE_API_URL=https://wss.dokaai.com
```

or:

```env
NEXT_PUBLIC_WSS_SERVICE_API_URL=https://wss.dokaai.com/v1/wss
```

If the URL contains `/v1/wss`, the app automatically connects using the Socket.IO handshake path `/v1/wss/socket.io`.

After changing `.env.local`, restart the dev server. Next.js bundles `NEXT_PUBLIC_*` env values into the frontend.

## Install Dependencies

From the app folder:

```bash
cd frontend
npm install
```

## Run Locally

Start the Next.js dev server:

```bash
cd frontend
npm run dev
```

Open:

```txt
http://localhost:3000
```

You can also open the sign-in page directly:

```txt
http://localhost:3000/signin
```

## Login Form

The sign-in form asks for:

- Customer JWT private key
- Customer signing key id
- Unique customer id
- Workspace id
- Product space code

These values are sent once to the BFF to generate a customer JWT.

The frontend does not generate the token itself.

## Token Creation Flow

```txt
User fills login form
  -> frontend calls POST /api/auth/customer-token
    -> Next route delegates to backend/apis/customer-token.ts
      -> BFF calls DokaAI token API using NUDGE_SERVICE_API_URL
        -> BFF returns the generated customer JWT to frontend
```

After login, the frontend stores only session/runtime values:

```txt
customerUniqueCustomerId
customerWorkspaceId
customerProductSpaceCode
jwtToken
```

The frontend does not persist private key or signing key id in localStorage.

## API Flow

Notification and preference screens call local app APIs:

```txt
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:notificationId/read
GET    /api/preferences
PATCH  /api/preferences/groups/:groupId
PATCH  /api/preferences/topics/:topicId
```

Each route delegates to a backend handler:

```txt
frontend/src/app/api/**/route.ts
  -> backend/apis/*.ts
    -> DokaAI API
```

The BFF attaches the customer JWT as:

```txt
Authorization: Bearer <jwtToken>
```

## WebSocket Flow

The frontend connects directly to the public Socket.IO service:

```txt
frontend socket client
  -> NEXT_PUBLIC_WSS_SERVICE_API_URL
    -> sends auth.token = Bearer <jwtToken>
```

Socket events are listened to on:

```txt
inAppMessage
```

## Useful Routes

```txt
/signin       Login screen
/             Dashboard overview
/notification Notifications dashboard
/preferences  Preference settings
```

Protected pages show the login screen when there is no active session.

## Validation

Run TypeScript validation from `frontend/`:

```bash
npm run typecheck
```

Build the app:

```bash
npm run build
```

## Common Issues

### Env var changes are not reflected

Restart the dev server after changing `.env.local`.

### Socket connection is failing

Check `NEXT_PUBLIC_WSS_SERVICE_API_URL`.

For the current DokaAI setup, use:

```env
NEXT_PUBLIC_WSS_SERVICE_API_URL=https://wss.dokaai.com/v1/wss
```

The app will derive the Socket.IO path as:

```txt
/v1/wss/socket.io
```

### API calls are failing

Check `NUDGE_SERVICE_API_URL`.

For the current DokaAI setup, use:

```env
NUDGE_SERVICE_API_URL=https://api.dokaai.com/v1/dokaai
```

Also confirm the login form values are valid for the workspace and product space.

### Do I need to run the backend folder?

No. In this demo, `backend/` is imported by the Next.js API routes. Running `npm run dev` from `frontend/` is enough.

## Notes for Developers

- Keep token generation inside the BFF/backend layer.
- Do not generate JWTs in browser code.
- Do not store private key or signing key id in localStorage.
- Keep frontend API clients pointed at local `/api/*` routes.
- Add new backend API handlers inside `backend/apis/`.
- Keep Next route files inside `frontend/src/app/api/**/route.ts` as thin mounts.
