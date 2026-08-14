# Momentum 

This workspace contains the `momentum`, a productivity application with a React + Vite frontend and an Express + TypeScript backend.



## Project Structure


- `momentum/`
  - `client/` — React app built with Vite, TypeScript, Tailwind, and React Router.
  - `server/` — Express API server using TypeScript, MongoDB/Mongoose, JWT auth, and validation with Zod.
- `Personal portfolio website.html` — standalone HTML file at the workspace root.

## Requirements

- Node.js `>= 20`
- npm
- MongoDB instance for the backend (or a connection string via `.env`)
- 

## Getting Started


From the `momentum/` folder:

```bash
cd momentum
npm install
npm run dev
```

This runs both the client and server concurrently:

- `npm run dev:client` — starts the Vite development server for the frontend
- `npm run dev:server` — starts the TypeScript Express backend with `tsx watch`
- 

## Build


To build both client and server:

```bash
cd momentum
npm run build
```

## Testing

Run server tests from the workspace root:

```bash
cd momentum
npm test
```

## Workspace Packages

### Client

- `npm run dev` — run Vite development server
- `npm run build` — compile TypeScript and build the production bundle
- `npm run preview` — preview the built client

### Server


- `npm run dev` — run the server in watch mode with `tsx`
- `npm run build` — compile TypeScript to `dist/`
- `npm run test` — run unit tests in `src/__tests__/`
- `npm run start` — start the compiled server from `dist/index.js`

## Notes


- The backend expects environment variables for configuration (e.g. database URL, JWT secret).
- For a local dev environment, check `momentum/server/src/config/env.ts` and `momentum/server/src/config/db.ts`.
