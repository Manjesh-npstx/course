# React Project: Folder Structure & Coding Standards

**Project:** Support Ticket Tracker (`ticket-web`)  
**Stack:** React 18, Vite, JavaScript, React Router, Vitest  
**Audience:** Developers joining or contributing to this codebase

This document explains **where code lives**, **why**, and **rules everyone must follow** so reviews stay consistent and the app stays easy to navigate.

For local setup, env vars, and scripts, see the root [README.md](../README.md).

---

## 1. Goals

- **Find code quickly** — same pattern for every feature.
- **Keep components small** — one responsibility, predictable file names.
- **Make security and quality explicit** — services for API, constants for copy, no secrets in the client.
- **Pass the quality gate** before every commit: `npm run lint`, `npm run format:check`, `npm test`, `npm run build`.

**Principle:** Simple beats clever. Every abstraction must be explainable in one sentence; if not, remove it.

---

## 2. Repository layout (root)

```text
ticket-web/
├── public/              # Static files served as-is (icons, etc.)
├── src/                 # All application source code
├── docs/                # Team docs and training walkthroughs
├── scripts/             # Optional tooling (e.g. build helpers)
├── index.html           # Vite HTML entry
├── vite.config.js       # Vite config; `@/` alias → src/
├── package.json
├── .env.example         # Required env vars (copy to .env locally)
├── eslint.config.js
└── .prettierrc
```

**Do not commit:** `.env` with real values, credentials, or API secrets. `VITE_*` variables are **public** in the built app.

---

## 3. `src/` folder structure (standard)

We use a **feature-based** layout with **shared layers**. New work should fit here unless the team agrees on a change.

```text
src/
├── main.jsx                 # Bootstrap: mount app, validate env, API setup
├── App.jsx                  # Routes, providers, app-wide behavior (e.g. idle modal)
│
├── config/                  # Environment and app configuration
├── constants/               # Routes, roles, messages, storage keys, limits
├── styles/                  # Design tokens + global CSS
│
├── services/                # All HTTP/API access
├── utils/                   # Pure helpers (no React, no fetch)
│
├── context/                 # React Context providers
├── hooks/                   # Custom hooks
│
├── components/
│   ├── ui/                  # Reusable presentational components
│   └── layout/              # Shell, navbar, route guards, error boundary
│
├── features/                # Domain-specific UI and local schemas
│   ├── auth/
│   ├── tickets/
│   └── comments/
│
├── pages/                   # One component per route (thin composition layer)
│
└── tests/                   # Vitest setup and tests
```

### 3.1 Layer responsibilities

| Layer                  | Purpose                                              | May import from                                         | Must not                                            |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| **pages/**             | Route screens; compose layout + features             | layout, features, hooks, constants                      | Direct `fetch`/axios; heavy business logic          |
| **features/**          | Forms, lists, filters for one domain                 | ui, hooks, services (via hooks/pages), constants, utils | Duplicate generic UI that belongs in `ui/`          |
| **components/ui/**     | Buttons, inputs, modals, empty/error states          | constants (labels if needed), styles                    | API calls; feature-specific business rules          |
| **components/layout/** | Navbar, page shell, `ProtectedRoute`, error boundary | ui, hooks, constants                                    | Feature forms/lists                                 |
| **services/**          | API modules + shared `api.js`                        | config, constants, tokenStorage                         | React components or hooks                           |
| **hooks/**             | Reusable stateful logic                              | context, services, utils                                | JSX (except tests)                                  |
| **context/**           | Global client state (auth, toasts)                   | services, tokenStorage                                  | Feature-specific ticket UI                          |
| **constants/**         | Single source for paths, copy, limits                | —                                                       | Side effects                                        |
| **utils/**             | Pure functions                                       | constants (if needed)                                   | Side effects, API                                   |
| **styles/**            | `tokens.css` (variables), `global.css`               | —                                                       | Prefer `ui.css` / `layout.css` for component styles |

### 3.2 File placement cheat sheet

| I need to…                                 | Put it in…                                                     |
| ------------------------------------------ | -------------------------------------------------------------- |
| Add a new URL/screen                       | `pages/` + route in `constants/routes.js` + route in `App.jsx` |
| Add login/register field validation schema | `features/auth/schemas.js` (or feature-local `*Schema.js`)     |
| Add a reusable text field                  | `components/ui/TextInput.jsx` (+ PropTypes)                    |
| Call the tickets API                       | `services/ticketService.js`                                    |
| Store/read auth token                      | `services/tokenStorage.js` **only**                            |
| Show user-facing error text                | `constants/messages.js`                                        |
| Check if UI may show an admin action       | `utils/permissions.js` (API still enforces)                    |
| Share auth state                           | `context/AuthContext.jsx` + `hooks/useAuth.js`                 |

---

## 4. Naming conventions

| Kind       | Convention                          | Example                                                |
| ---------- | ----------------------------------- | ------------------------------------------------------ |
| Components | PascalCase, one per file            | `TicketList.jsx`                                       |
| Hooks      | `use` + camelCase                   | `useTickets.js`                                        |
| Services   | camelCase, `*Service.js`            | `ticketService.js`                                     |
| Utils      | camelCase                           | `formatDate.js`, `validators.js`                       |
| Functions  | verbNoun                            | `formatTicketDate`, `validateEmail`                    |
| Constants  | UPPER_SNAKE_CASE in dedicated files | `ROUTES`, `ROLES`                                      |
| Booleans   | `is*`, `has*`, `can*`               | `isLoading`, `canDeleteTicket`                         |
| CSS        | Co-located where practical          | `components/ui/ui.css`, `components/layout/layout.css` |
| Imports    | Absolute with `@/` alias            | `import { ROUTES } from '@/constants/routes.js'`       |

---

## 5. General code standards

- One component per file, one responsibility per function.
- Components under **100 lines**, functions under **30 lines** (guidelines; split when clarity suffers).
- No duplicated JSX or logic: if it appears twice, extract it.
- No magic strings or numbers: use `src/constants/`.
- No `console.log`, no commented-out code, no leftover TODOs.
- Comments explain **why**, not what.
- Conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`).

---

## 6. React standards

- **Functional components and hooks only.** No Redux, no UI library, no TypeScript in this training app.
- **Presentational vs feature:** Generic look-and-feel → `ui/`; ticket/auth/comment behavior → `features/`.
- **Reusable `ui/` components:** JSDoc + PropTypes, sensible defaults, no hardcoded user-facing text or colors.
- **Lists:** Stable `key` (prefer id over array index).
- **State:** Never mutate objects/arrays in place.
- **Effects:** Complete dependency arrays; cleanup subscriptions/timeouts where needed.
- **Async UI:** Every data fetch handles **loading**, **error**, and **empty** (e.g. `DataState`).
- **Forms:** Disable submit while a request is in flight (prevent double submit).
- **Destructive actions:** Use a confirmation dialog.

---

## 7. Styling standards

- All colors, spacing, and typography via **CSS variables** in `src/styles/tokens.css`.
- Global resets and utilities in `src/styles/global.css`.
- **No inline styles** in components.

---

## 8. API and data standards

- **All HTTP** goes through `services/` (`api.js` + `*Service.js`).
- Components and `ui/` **do not** call `fetch` or axios directly.
- **Token access** only through `services/tokenStorage.js`.
- User-visible errors come from `constants/messages.js` where possible.

---

## 9. Security standards (frontend)

- Never `dangerouslySetInnerHTML`, `eval`, or HTML built from user input.
- Never log or display tokens, passwords, or stack traces.
- Login failures: **generic** message (e.g. invalid username or password).
- **Hiding a button is UX, not security.** The API enforces every rule. Add a short comment wherever `permissions.js` gates UI.
- No secrets in committed `.env`; document keys in `.env.example` only.

---

## 10. Accessibility standards

- Every input has a **visible label** linked with `htmlFor` / `id`.
- Errors use `role="alert"` or `aria-live` where appropriate.
- Keyboard usable: `<button>` for actions, `<Link>` / `<a>` for navigation; no clickable `<div>`.
- Modals: focus trap, close on Esc, return focus on close.
- Status/priority: not color-only (badges include text).

---

## 11. Reusable `components/ui/` inventory

| Component                              | Role                                        |
| -------------------------------------- | ------------------------------------------- |
| `Button`                               | Primary/secondary actions, loading state    |
| `TextInput`, `PasswordInput`, `Select` | Form controls                               |
| `FormField`                            | Label + error wrapper                       |
| `Card`                                 | Content surface                             |
| `Badge`                                | Status/priority display                     |
| `Modal`, `ConfirmDialog`               | Dialogs and confirmations                   |
| `Toast`                                | Toast item (with `ToastContext`)            |
| `Loader`, `EmptyState`, `ErrorMessage` | Async feedback                              |
| `DataState`                            | Composes loading / error / empty / children |
| `Pagination`                           | Paged lists                                 |

See [README.md](../README.md) for main props and where each component is used.

---

## 12. Testing

- Tests live under `src/tests/` (project may also use `*.test.jsx` next to source).
- Run **`npm test`** before commit.
- Test behavior users care about, not implementation details.

---

## 13. Quality gate (before every commit)

| Command                | Requirement                   |
| ---------------------- | ----------------------------- |
| `npm run lint`         | Zero errors and zero warnings |
| `npm run format:check` | Must pass                     |
| `npm test`             | Must pass                     |
| `npm run build`        | Must succeed                  |

---

## 14. `src/` file map (quick reference)

| Path                         | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `main.jsx`                   | Bootstraps app, validates env, configures API    |
| `App.jsx`                    | Routes, idle session modal, providers            |
| `config/env.js`              | Validates `VITE_*` variables                     |
| `constants/routes.js`        | Route paths and ticket detail helper             |
| `constants/roles.js`         | `ADMIN` and `USER` role constants                |
| `constants/messages.js`      | User-facing copy and API messages                |
| `constants/storageKeys.js`   | Browser storage key names                        |
| `constants/limits.js`        | Pagination, validation, debounce limits          |
| `styles/tokens.css`          | Design tokens (colors, spacing, typography)      |
| `styles/global.css`          | Global layout and utility classes                |
| `services/api.js`            | HTTP client, interceptors, error normalization   |
| `services/tokenStorage.js`   | Only module that touches `localStorage` for auth |
| `services/authService.js`    | Login, register, `/auth/me`                      |
| `services/ticketService.js`  | Ticket CRUD and list                             |
| `services/commentService.js` | Ticket comments                                  |
| `services/auditService.js`   | Admin summary and audit log                      |
| `utils/permissions.js`       | UI permission helpers                            |
| `utils/formatDate.js`        | Consistent date formatting                       |
| `utils/maskValue.js`         | Mask sensitive values in admin audit table       |
| `utils/validators.js`        | Shared validation helpers                        |
| `context/AuthContext.jsx`    | Authenticated user state                         |
| `context/ToastContext.jsx`   | Toast notification state                         |
| `hooks/useAuth.js`           | Reads `AuthContext`                              |
| `hooks/useToast.js`          | Reads `ToastContext`                             |
| `hooks/useIdleTimer.js`      | Idle warning and token expiry sign-out           |
| `hooks/useTickets.js`        | Paginated ticket list fetching                   |
| `components/ui/*`            | Reusable presentational components               |
| `components/layout/*`        | Shell, navbar, guards, error boundary            |
| `features/auth/*`            | Login/register forms and Zod schemas             |
| `features/tickets/*`         | List, filters, ticket form                       |
| `features/comments/*`        | Comment list and form                            |
| `pages/*`                    | Route-level page components                      |
| `tests/*`                    | Vitest setup and tests                           |
