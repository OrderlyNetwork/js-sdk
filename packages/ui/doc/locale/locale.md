# Locale Module Reference

> Location: `packages/ui/src/locale/*.ts(x)`

## Overview

The Locale module implements a lightweight translation layer for UI strings. It exposes a provider, a `useLocale` hook, and default English messages for common namespaces (dialog, table, etc.). This keeps bundle size small while still enabling runtime language changes.

## Source Structure

| File           | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| `context.ts`   | Declares the locale context and supporting types (`Locale`, `LocaleContext`). |
| `provider.tsx` | `LocaleProvider`, handling locale state and message dictionaries.             |
| `useLocale.ts` | Hook returning `[messages, localeCode]` for a given namespace.                |
| `en.ts`        | Default English strings.                                                      |
| `index.ts`     | Public exports.                                                               |

## Exports & Types

### `LocaleProvider`

```typescript
const LocaleProvider: React.FC<LocaleProviderProps>
```

Provider component that supplies locale messages.

### `useLocale`

```typescript
function useLocale<C extends LocaleComponentName = LocaleComponentName>(
  componentName: C,
  defaultLocale?: Locale[C] | (() => Locale[C]),
): readonly [NonNullable<Locale[C]>, string];
```

Hook for accessing locale messages for a specific component namespace.

### `LocaleProviderProps`

```typescript
type LocaleProviderProps = {
  locale: Locale;
  children?: React.ReactNode;
};
```

### `Locale`

```typescript
interface Locale {
  locale: string;
  [componentName: string]: Record<string, string> | string;
}
```

Locale object structure with component namespaces.

### `LocaleComponentName`

```typescript
type LocaleComponentName = Exclude<keyof Locale, "locale">;
```

Component namespace names (e.g., "dialog", "table", "pagination").

## Props & Behavior

### LocaleProvider Props

#### `locale` (required)

```typescript
locale: Locale;
```

Locale object containing messages for all component namespaces.

#### `children`

```typescript
children?: React.ReactNode
```

Child components.

### useLocale Return Value

#### `messages`

```typescript
messages: NonNullable<Locale[C]>;
```

Messages object for the specified component namespace.

#### `localeCode`

```typescript
localeCode: string;
```

Current locale code (e.g., "en", "zh-CN").

## Usage Examples

### Basic Locale Provider

```tsx
import { LocaleProvider, useLocale } from "@veltodefi/ui";

const messages = {
  locale: "en",
  dialog: {
    ok: "Confirm",
    cancel: "Cancel",
  },
  table: {
    empty: "No data",
  },
};

<LocaleProvider locale={messages}>
  <App />
</LocaleProvider>;
```

### Using useLocale Hook

```tsx
import { useLocale } from "@veltodefi/ui";

function DialogExample() {
  const [dialogLocale] = useLocale("dialog");

  return (
    <>
      <Button>{dialogLocale.ok}</Button>
      <Button variant="outlined">{dialogLocale.cancel}</Button>
    </>
  );
}
```

### Multiple Locales

```tsx
import { LocaleProvider, useLocale } from "@veltodefi/ui";

const enMessages = {
  locale: "en",
  dialog: { ok: "Confirm", cancel: "Cancel" },
};

const zhMessages = {
  locale: "zh-CN",
  dialog: { ok: "确认", cancel: "取消" },
};

function App() {
  const [locale, setLocale] = useState("en");
  const messages = locale === "en" ? enMessages : zhMessages;

  return (
    <LocaleProvider locale={messages}>
      <LocaleSwitcher />
      <DialogExample />
    </LocaleProvider>
  );
}
```

### With Default Locale

```tsx
import { useLocale } from "@veltodefi/ui";

function CustomComponent() {
  const [messages, localeCode] = useLocale("dialog", {
    ok: "OK",
    cancel: "Cancel",
  });

  return <Button>{messages.ok}</Button>;
}
```

## Implementation Notes

- Locale messages are merged with defaults, allowing partial overrides
- Default English messages are provided in `en.ts`
- `useLocale` returns a tuple `[messages, localeCode]` for convenience
- Messages can be functions for computed values
- Locale context is memoized to prevent unnecessary re-renders

## Integration Tips

1. Split message bundles per namespace and load them lazily for large apps.
2. Always provide a populated `fallbackLocale` to avoid undefined strings in critical flows.
3. Use the returned `setLocale` function from `useLocale` to build language switchers without prop drilling.
4. Keep locale objects flat within namespaces for easier maintenance.
5. Use TypeScript to type-check locale keys for better developer experience.
