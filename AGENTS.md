# AGENTS.md - Agent Coding Guidelines

This document provides guidelines for agents operating in the Orderly Web repository.

## Project Overview

This is a pnpm monorepo using Turbo for build orchestration. It contains:

- `packages/` - UI components, hooks, utilities, and feature packages
- `apps/storybook` - Storybook for component development and documentation

## Build/Lint/Test Commands

### Package Manager

- **pnpm** is required (v10.26.2+)
- Node.js v20.19.0+

### Root Commands

```bash
# Development
pnpm dev                    # Start storybook dev server
pnpm dev:watch             # Watch mode for all packages (concurrency=21)

# Building
pnpm build                 # Build all packages via turbo
pnpm build-storybook       # Build storybook for production

# Linting
pnpm lint                  # Run ESLint on all packages
pnpm lint:fix              # Auto-fix ESLint issues
pnpm lint:error            # Show only ESLint errors (no warnings)
pnpm lint:fix-error        # Fix only ESLint errors

# Formatting
pnpm format                # Format all files with Prettier

# Testing
pnpm test                  # Run tests via turbo (most packages have no tests)

# Storybook
pnpm storybook             # Start storybook on port 6006
pnpm storybook:tradingPage # Start storybook with trading page
```

### Single Package Commands

```bash
# From package directory
cd packages/<package-name>
pnpm dev                   # Watch mode with tsup
pnpm build                 # Build with tsup
pnpm lint                  # Lint specific package
```

### Single Test Run

```bash
# For packages with vitest (apps/storybook)
cd apps/storybook
npx vitest run --testNamePattern="test name"
npx vitest run --grep "pattern"
```

## Code Style Guidelines

### TypeScript

- Target: ES2022
- `noImplicitAny: false` (explicit types not strictly required)
- Use strict null checks when applicable

### ESLint Configuration

- Config: `@orderly.network/eslint-config` (see `packages/eslint-config/index.mjs`)
- Key rules:
  - No relative imports outside package (monorepo-cop)
  - Prefer `const` over `let`
  - No `console.log` (warn only - `warn`, `error` allowed)
  - React hooks rules enforced
  - React refresh for HMR compatibility

### Prettier Formatting

- Config: `prettier` + `prettier-plugin-tailwindcss`
- Run `pnpm format` to format all files

### Imports

- Use workspace imports: `import { X } from "@orderly.network/package-name"`
- No relative imports across packages (enforced by ESLint)
- Organize imports: React -> external libs -> internal packages -> types

### Naming Conventions

| Type       | Convention          | Example                   |
| ---------- | ------------------- | ------------------------- |
| Folders    | camelCase           | `positionInfo/`           |
| Files      | camelCase           | `positionInfo.script.tsx` |
| Components | PascalCase          | `PositionInfo`            |
| Types      | PascalCase          | `PositionInfoProps`       |
| Hooks      | usePascalCase       | `usePositionInfoScript`   |
| Widgets    | PascalCase + Widget | `PositionInfoWidget`      |

## Widget Pattern (Four-Piece Set)

Standard widgets follow this structure in `packages/*/src/components/`:

```
componentName/
├── componentName.script.tsx   # Data logic, business logic (no JSX)
├── componentName.ui.tsx       # Pure UI, i18n, formatting
├── componentName.widget.tsx    # Connects script + ui, registers Dialog/Sheet
└── index.ts                   # Unified exports
```

### Script Layer (`*.script.tsx`)

- **Responsibility**: Data logic, business logic, state management
- Returns raw numeric values, booleans, objects - NOT formatted strings
- Use `useMemo`/`useCallback` for optimization
- **NO i18n** - script provides raw data, UI decides how to display
- Use `Decimal` from `@orderly.network/utils` for numeric calculations
- Use `useLocalStorage` from `@orderly.network/hooks` for local caching
- Example return: `{ value: 0.0001, isLong: true }` (not `"0.01%"`)

### UI Layer (`*.ui.tsx`)

- **Responsibility**: Display logic, i18n, formatting
- Pure presentation - all data from props, events through props
- Uses i18n for internationalization: `i18n.t("module.key")`
- Handles number formatting with `Numeral` or `Text.formatted`
- Example: `i18n.t("trading.rate") + ": " + formatPercentage(rate)`

### Widget Layer (`*.widget.tsx`)

- Connects script and UI
- Passes external props to script
- Passes script state to UI
- Optionally registers Dialog/Sheet with IDs

### Dialog/Sheet Registration

If widget needs Dialog/Sheet:

```typescript
// In widget.tsx
export const MyWidgetDialogId = "MyWidgetDialogId";
export const MyWidgetSheetId = "MyWidgetSheetId";

registerSimpleSheet(MyWidgetSheetId, MyWidgetWidget);
registerSimpleDialog(MyWidgetDialogId, MyWidgetWidget, {
  classNames: { content: "w-[420px]" },
});
```

### i18n Workflow

1. Search `@orderly.network/i18n` for existing keys first
2. Add new keys to `packages/i18n/src/locale/module/`:
   - Common: `common.ts` (Cancel, Confirm, Save)
   - Positions: `positions.ts`
   - Trading: `trading.ts`
   - Orders: `orders.ts`
3. Key format: `module.keyName` (e.g., `common.cancel`)
4. Only add to .ts files, not JSON translation files
5. i18n only in UI layer, NEVER in script

## Numeric Calculations

Always use `Decimal` from `@orderly.network/utils`:

```typescript
import { Decimal } from "@orderly.network/utils";

const rate = new Decimal(0.0001);
const result = amount.times(price).div(100);
```

## Local Storage

Use `useLocalStorage` hook from `@orderly.network/hooks`:

```typescript
import { useLocalStorage } from "@orderly.network/hooks";

const [storedValue, setValue] = useLocalStorage<T>("key", initialValue);
```

## Comments

- All comments in English
- Use JSDoc for complex functions
- Avoid obvious comments

## Error Handling

- Use try/catch for async operations
- Show user-friendly errors via `toast.error()`
- Log errors with `console.error` for debugging

## Styling

- Tailwind CSS with `tailwind-merge` and `tailwind-variants`
- Use `@orderly.network/ui` components when available
- Check `packages/ui/doc/components.md` for available components

## Key Packages

| Package                    | Purpose                   |
| -------------------------- | ------------------------- |
| `@orderly.network/ui`      | Base UI components        |
| `@orderly.network/hooks`   | React hooks               |
| `@orderly.network/utils`   | Utilities (Decimal, etc.) |
| `@orderly.network/i18n`    | Internationalization      |
| `@orderly.network/types`   | TypeScript types          |
| `@orderly.network/markets` | Market data               |
| `@orderly.network/perp`    | Perpetual trading logic   |

## Cursor Commands

Custom commands in `.cursor/commands/`:

- `newwidget` - Create new standard Widget (four-piece set)
- `editwidget` - Edit existing Widget or add fields

See `.cursor/commands/newwidget.md` and `.cursor/commands/editwidget.md` for detailed usage.

## References

- Widget specs: `specs/002-widget-rules.md`
- Component docs: `packages/ui/doc/components.md`
- Example: `packages/ui-leverage/src/symbolLeverage/`
