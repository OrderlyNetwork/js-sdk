# AGENTS.md - Agent Coding Guidelines

This document provides guidelines for agents operating in the Orderly Web repository.

## Project Overview

This is a pnpm monorepo using Turbo for build orchestration. It contains:

- `packages/` - UI components, hooks, utilities, and feature packages
- `apps/storybook` - Storybook for component development and documentation
- `apps/ai-docs` - Documentation site generators for components and hooks

Requires pnpm v10+ and Node.js v20.19.0+.

## Commands

### Root Commands

```bash
# Development
pnpm dev                    # Start Vite dev server - prefer this for testing (faster, no
                            # Storybook chrome); NOT the Storybook server itself
pnpm dev:watch              # Watch mode for all packages (concurrency=21)

# Building
pnpm build                  # Build all packages via turbo
pnpm build-storybook        # Build storybook for production

# Linting / Formatting
pnpm lint                   # Run ESLint on all packages
pnpm lint:fix               # Auto-fix ESLint issues
pnpm lint:error             # Show only ESLint errors (no warnings)
pnpm lint:fix-error         # Fix only ESLint errors
pnpm format                 # Format TypeScript, TSX, and Markdown files with Prettier

# Storybook
pnpm storybook              # Start storybook on port 6006 (use only when testing Stories)
pnpm storybook:tradingPage  # Start storybook with trading page
```

### Package Commands and Tests

- Check the target package's `package.json` before running `dev`, `build`, `lint`, or `test`; scripts differ by package.
- Run a package's tests with its own script, for example `pnpm --filter @orderly.network/react-app test` (Vitest), `pnpm --filter @orderly.network/hooks test` (Jest), or `pnpm --filter @orderly.network/cli test` (Node test runner).
- For one Storybook test, use `cd apps/storybook && pnpm exec vitest run -t "test name"`.
- The root `pnpm test` script currently fails because `turbo.json` has no `test` task. Some packages also have placeholder `test` scripts that exit with an error.

## Code Style

- TypeScript: target ES2022, `noImplicitAny: false`
- ESLint: root `eslint.config.mjs` extends `@orderly.network/eslint-config` (installed from npm)
  - No relative imports across packages (monorepo-cop); use `@orderly.network/<package>` imports
  - `console.log` warns (`console.warn` / `console.error` allowed)
- Prettier uses `@orderly.network/prettier-config`; its Tailwind class sorting plugin is currently disabled. `pnpm format` covers `ts`, `tsx`, and `md` files across the repository; for routine edits, format only changed files with `pnpm exec prettier --write <file>`.
- Import order: React -> external libs -> `@orderly.network/*` packages -> types
- Naming: folders/files camelCase; components/types PascalCase; hooks `usePascalCase`; widget components end with `Widget`
- Comments in English only; JSDoc for complex functions
- Show user-facing errors via `toast.error()`; wrap async operations in try/catch

## Widget Pattern (Four-Piece Set)

Standard widgets use this structure; their location varies by package:

```
componentName/
├── componentName.script.tsx   # Data logic and interaction handling
├── componentName.ui.tsx       # Presentation and formatting
├── componentName.widget.tsx   # Connects script + ui, registers Dialog/Sheet
└── index.ts                   # Unified exports
```

### Script Layer (`*.script.tsx`)

- Data logic, business logic, state management
- Return raw values for data rendered by the UI (e.g. `{ value: 0.0001, isLong: true }`, not `"0.01%"`).
- Interaction handlers may translate Toast or modal messages and provide JSX for dialog content when needed.

### UI Layer (`*.ui.tsx`)

- Pure presentation - all data from props, events through props
- Handles presentation text with i18n (`i18n.t("module.key")`) and number formatting (`Numeral`, `Text.formatted`)

### Widget Layer (`*.widget.tsx`)

- Connects script and UI; passes external props to script and script state to UI
- Widgets needing a Dialog/Sheet register it via `registerSimpleDialog` / `registerSimpleSheet` from `@orderly.network/ui` (example: `packages/ui-transfer/src/components/reverseConvert/`)

### i18n Workflow

1. Search `@orderly.network/i18n` for existing keys first
2. Add new keys to `packages/i18n/src/locale/module/` - pick the module matching the feature (not exhaustive: `common.ts`, `positions.ts`, `trading.ts`, `orders.ts`, `markets.ts`, `transfer.ts`, `portfolio.ts`, ...)
3. Key format: `module.keyName` (e.g., `common.cancel`)
4. Only add to `.ts` module files, never edit the JSON translation files in `packages/i18n/locales/` - they are generated via the `translate-locales` skill
5. Use i18n in the UI layer for displayed text; script handlers may translate interaction feedback such as Toast and modal messages
6. Never compose i18n keys dynamically (template literals or variables). Static key extraction only sees literal keys - ``t(`common.${side}`)`` silently loses translations while tests (identity-mocked i18n) still pass, and an ESLint `no-restricted-syntax` rule in the root `eslint.config.mjs` rejects interpolated keys. When labels are keyed by a domain union (outcome/side/status/phase), use the label-map pattern from `packages/prediction/src/prediction/predictionLabels.ts`: a `Record<Union, string>` whose values are literal `i18n.t("key")` calls, so a missing entry becomes a compile error instead of a runtime gap.

## Utilities & Conventions

- Numeric calculations: always use `Decimal` from `@orderly.network/utils` (never raw float math)
- Local storage: use `useLocalStorage` from `@orderly.network/hooks`
- Styling: Tailwind CSS with `tailwind-merge` and `tailwind-variants`; prefer `@orderly.network/ui` components
- Never hardcode colors - use `oui-*` Tailwind classes or theme variables from `apps/storybook/src/theme/customTheme.ts` (see the `replace-hardcoded-colors` skill)

### API Response Envelopes (rows unwrap)

The net layer `get()` (behind `useQuery`/`usePrivateQuery`/`fetcher`; see `packages/net/src/fetch/index.ts`) unwraps success envelopes before SWR sees the data:

- `{ success, data: { rows: [...] } }` → returns the bare `rows` array; `meta` is silently dropped.
- Any other `data` shape (object without a top-level `rows`, or a bare array) → returned as-is.
- Passing `formatter: (data) => data` bypasses the unwrap and keeps the full `data` object - use this when you need `meta`.

Rules:

- Type rows endpoints as arrays: `useQuery<API.MarketInfo[]>("/v1/public/futures")` - never `useQuery<{ rows: ... }>`. The runtime mismatch is invisible to TypeScript: `data?.rows` is silently `undefined` and the feature renders empty.
- API-doc envelope examples (`{ success, data: ... }`) describe the HTTP response only; the hook never sees `success`/`data`.

## Key Packages

Non-exhaustive list of the most commonly used packages:

| Package                    | Purpose                   |
| -------------------------- | ------------------------- |
| `@orderly.network/ui`      | Base UI components        |
| `@orderly.network/hooks`   | React hooks               |
| `@orderly.network/utils`   | Utilities (Decimal, etc.) |
| `@orderly.network/i18n`    | Internationalization      |
| `@orderly.network/types`   | TypeScript types          |
| `@orderly.network/markets` | Market data               |
| `@orderly.network/perp`    | Perpetual trading logic   |

## Custom Commands

Command definitions tracked by this repository live in `.cursor/commands/`:

- `newwidget` - Create new standard Widget (four-piece set)
- `editwidget` - Edit existing Widget or add fields
- `specflow` - Manage SpecFlow R&D workflow tasks
- `mcp-test-sdk-docs` - MCP Inspector test workflow for `@orderly.network/sdk-docs`

## References

- Component docs: `packages/ui/doc/` (start at `index.md`; one folder per component)
- Widget example: `packages/ui-leverage/src/symbolLeverage/`
- Repo-specific agent skills: `.agents/skills/` (auto-discovered with descriptions; use when a task matches)
