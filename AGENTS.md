# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React 18 + TypeScript app: components in `src/components`, pages in `src/pages`, state in `src/contexts`, hooks in `src/hooks`, helpers in `src/utils`, and types in `src/types`; use the `@/...` alias for shared imports.
- `tests/unit` and `tests/integration` mirror production modules; add specs alongside the logic they cover.
- `public/` serves static assets, `dist/` is generated output, `docs/` records product decisions, and `scripts/` holds operational helpers. Capacitor shells live in `android/` and `ios/`.

## Build, Test, and Development Commands
- `npm install` installs dependencies after any `package.json` change.
- `npm run dev` starts Vite on `http://localhost:5173`; `npm run preview` serves the built bundle locally.
- `npm run build` runs `tsc` then `vite build`; run it before tagging releases.
- `npm run test` runs Vitest; `npm run test:ui` opens the Vitest UI for focused debugging.
- `npm run lint` and `npm run type-check` must pass pre-PR.
- `node scripts/check-dev-server.js` confirms local server health, `node scripts/mobile-test.js` surfaces LAN URLs, and `npm run cap:sync` prepares native shells.

## Coding Style & Naming Conventions
- Follow strict TypeScript, 2-space indentation, and single quotes except when template literals read better. Keep React components as PascalCase files exporting a default function.
- Use camelCase for variables and hooks (`useLoanCalculator`), descriptive utility filenames, and inline Tailwind classes within JSX.
- Lean on ESLint autofixes; document any `eslint-disable` usage.

## Testing Guidelines
- Name specs `*.test.ts` or `*.test.tsx`; place unit logic in `tests/unit` and flows in `tests/integration`.
- Prefer React Testing Library with `screen`/`userEvent` for UI assertions and isolate calculation helpers with deterministic data.
- Run `npm run test` before every commit and add coverage when touching loan formulas or shared contexts.

## Commit & Pull Request Guidelines
- Follow the conventional commit prefixes already in history (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`); add a scope when altering a specific module.
- PRs should state the problem, reference the relevant `docs/issues/*.md` ticket, and list the commands you ran (`npm run lint`, `npm run test`, `npm run build`).
- Attach screenshots for UI changes, flag doc updates in `docs/`, and note any Capacitor sync steps.

## Mobile & Deployment Notes
- Capacitor builds need a fresh `npm run build`; follow with `npm run cap:sync` before `npm run cap:run:android` or `npm run cap:run:ios`.
- Production deploys target Vercel; confirm environment variables from `.env.example` and never commit secrets.
