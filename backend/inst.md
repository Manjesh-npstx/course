---
description: Banking-app training standards for React, security, accessibility, and quality gates
alwaysApply: true
---

# Project Standards

## PURPOSE

Training project built to banking-app standards, but explainable line by line to junior developers. Simple beats clever. Every abstraction must be explainable in ONE sentence; if not, remove it.

## GENERAL CODE STANDARDS

- One component per file, one responsibility per function.
- Components under 100 lines, functions under 30 lines.
- No duplicated JSX or logic: if it appears twice, extract it.
- No magic strings or numbers: use src/constants/ (routes, roles, messages, storage keys, limits).
- No console.log, no commented-out code, no leftover TODOs.
- Comments explain WHY, not what.
- Naming: components PascalCase, hooks useCamelCase, functions verbNoun, constants UPPER_SNAKE_CASE, boolean names start with is/has/can.
- Absolute imports with the "@/" alias for src/.
- Conventional commit messages.

## REACT STANDARDS

- Functional components and hooks only. No Redux, no UI library, no TypeScript.
- Separate presentational components (ui/) from feature components (features/).
- Reusable components must have documented props (JSDoc + PropTypes), sensible defaults and no hardcoded text or colors.
- All styling through CSS variables (design tokens) in one file; no inline styles.
- API calls only in services/, never inside components.
- Every fetch handles loading, error and empty states.
- Effects: complete dependency arrays and cleanup where needed.
- Lists use stable keys; state is never mutated directly.

## SECURITY STANDARDS

- Never dangerouslySetInnerHTML. Never eval. Never build HTML from user input.
- Never log or display tokens, passwords or stack traces.
- VITE_ variables are public: no secrets in .env.
- All token access goes through src/services/tokenStorage.js only.
- Hiding a button is UX, NOT security; the API enforces every rule. Say this in a comment wherever permissions are checked in the UI.
- Login errors are generic ("Invalid username or password").
- Destructive actions need a confirmation dialog.
- Prevent double submit: disable the button while a request is running.

## ACCESSIBILITY STANDARDS

- Every input has a visible label linked with htmlFor/id.
- Errors are announced with role="alert" or aria-live.
- Fully keyboard usable; modals trap focus, close on Esc and return focus.
- Buttons are `<button>`, links are `<a>`/`<Link>`; no clickable divs.
- Color is never the only signal (badges also show text).

## QUALITY GATE (must pass before any commit)

- npm run lint has zero errors and zero warnings.
- npm run format:check passes.
- npm test passes.
- npm run build succeeds.

Day 1 Assignment: React Project Structure, Reusable Components & Registration Flow
Objective: Set up a proper React project structure and build the Login page, Page Layout (Header + Footer) and Registration form, with complete validation using the Zod library.
Requirements:
1. Proper folder structure — organize the project cleanly (e.g., components, pages, constants, services, hooks, utils), not everything in one folder.
2. Reusable components — build common UI elements (Button, Input, Card, etc.) once and reuse them across pages, instead of repeating code.
3. Constants file — keep fixed values (routes, messages, config, labels) in a dedicated constants file, not hardcoded inside components.
4. Page Layout — a shared layout with a Header and Footer that wraps all pages.
5. Login page — built using the reusable components above.
6. Registration form — built using the reusable components above.
7. Validation — every form (Login and Registration) must have proper validation using the Zod library, with clear error messages for each field.
Deliverable: Push the code to GitHub with a clear commit message, and be ready to explain your folder structure and how validation works.