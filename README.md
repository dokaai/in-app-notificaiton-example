# DokaAI In-App Notification Demo

Demo app for testing DokaAI in-app notifications, customer preferences, and live socket delivery.

## Folder Structure

```txt
backend/   BFF handlers used by the app APIs
frontend/  Next.js app that runs in the browser
```

For local development, you only run the `frontend` app. The `backend` folder is used by the Next.js API routes and does not need a separate server.

## Prerequisites

- Node.js 18 or newer
- npm
- DokaAI customer signing details

## Environment Setup

Create the local env file:

```bash
cd frontend
cp .env.example .env.local
```

Add these values in `frontend/.env.local`:

```env
NUDGE_SERVICE_API_URL=https://api.dokaai.com/v1/dokaai
NEXT_PUBLIC_WSS_SERVICE_API_URL=https://wss.dokaai.com/v1/wss
```

Restart the dev server whenever you change `.env.local`.

## Install

```bash
cd frontend
npm install
```

## Run

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

Sign-in page:

```txt
http://localhost:3000/signin
```

## Login Details Required

The sign-in form needs:

- Customer JWT private key
- Customer signing key id
- Unique customer id
- Workspace id
- Product space code

These details are sent to the app API to create a customer token. The browser does not create the token by itself.

You can also upload a DokaAI customer auth key `.txt` file on the sign-in screen. The app will fill any values it finds in the file, and you can manually enter anything that is missing.

## How Requests Work

```txt
Frontend
  -> local /api routes
    -> backend BFF handlers
      -> DokaAI APIs
```

The token flow:

```txt
Login form
  -> POST /api/auth/customer-token
    -> backend creates customer token
      -> frontend receives token
```

After login, the app stores only:

```txt
customerUniqueCustomerId
customerWorkspaceId
customerProductSpaceCode
jwtToken
```

Private key and signing key id are not stored in localStorage.

## App Pages

```txt
/signin        Sign in
/              Dashboard overview
/notification  Notifications
/preferences   Preferences
```

## Useful Commands

Run TypeScript checks:

```bash
npm run typecheck
```

Create a production build:

```bash
npm run build
```

Start a production build:

```bash
npm run start
```

## Troubleshooting

### App says an env variable is missing

Make sure `frontend/.env.local` exists and contains both required variables.

### Env changes are not working

Stop and restart `npm run dev`.

### API calls are failing

Check:

- `NUDGE_SERVICE_API_URL` is correct
- login form values are valid
- workspace id and product space code match the customer details

### Socket connection is failing

Check:

- `NEXT_PUBLIC_WSS_SERVICE_API_URL` is correct
- the customer token was generated successfully
- the dev server was restarted after env changes

For the current setup:

```env
NEXT_PUBLIC_WSS_SERVICE_API_URL=https://wss.dokaai.com/v1/wss
```
