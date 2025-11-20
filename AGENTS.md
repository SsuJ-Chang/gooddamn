# Repository Guidelines

## Project Structure & Module Organization
- Client (Vite + React): `src/` (pages in `src/pages`, state in `src/store.js`, sockets in `src/lib/socket.js`), static assets in `public/`.
- Server (Express + Socket.IO): `server/` with entry `server/index.js` and utilities in `server/votingPatterns/`.
- Tooling/config: `vite.config.js`, `tailwind.config.js`, `eslint.config.js`.

## Build, Test, and Development Commands
- Install: `npm install && npm --prefix server install`.
- Client dev: `npm run dev` (serves Vite app).
- Server dev: `npm --prefix server start` (runs on port 3001).
- Client build: `npm run build` → output in `dist/`.
- Client preview: `npm run preview` (serves built app).
- Lint: `npm run lint` (ESLint across repo; ignores `dist/`).

## Coding Style & Naming Conventions
- JavaScript/JSX, 2‑space indentation, ESM on client, CommonJS on server.
- React 19 functional components; prefer `PascalCase.jsx` for components/pages (e.g., `LobbyPage.jsx`).
- Hooks: `useSomething` naming; Zustand state in `src/store.js`.
- Keep modules focused; colocate page‑specific components under `src/pages/` when small.
- ESLint: uses `@eslint/js`, React Hooks, and React Refresh configs; fix warnings before PR.

## Testing Guidelines
- No test harness is configured yet. If adding tests, prefer Vitest + React Testing Library for client and a lightweight Node test runner for server.
- Name tests `*.test.jsx` or `*.test.js` colocated with sources or under `__tests__/`.
- Aim for meaningful coverage on new logic (stores, socket helpers, server handlers).

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Keep commits scoped and descriptive; reference issues like `#123` where relevant.
- PRs must include: concise description, screenshots/GIFs for UI changes, reproduction steps for bug fixes, and check that `npm run lint` passes.

## Security & Configuration Tips
- Server listens on `3001` with permissive CORS; restrict origins for production in `server/index.js`.
- Do not commit secrets. Add any future env files to `.gitignore`.
- Validate and sanitize any new socket or API inputs; follow existing patterns (`register`, `vote`, `showVotes`).

