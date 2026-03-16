# useTranslation

## Overview

Wrapper around `react-i18next`’s `useTranslation`. Uses the i18n instance from `I18nContext` when present (e.g. under `I18nextProvider`), otherwise falls back to the package’s default i18n instance. Subscribes to `bindI18nStore: "added"` so components re-render when new language resources are added.

## Exports

### `useTranslation`

```ts
function useTranslation<
  Ns extends FlatNamespace | $Tuple<FlatNamespace> | undefined,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(ns?: Ns, options?: UseTranslationOptions<KPrefix>)
```

Same signature as react-i18next’s `useTranslation`, with:

- `i18n`: from `I18nContext` if available, else default i18n
- `bindI18nStore: "added"` so translations update when resources are loaded
- Rest of `options` passed through

Returns the same return type as react-i18next (e.g. `{ t, i18n, ready }`).

## Usage example

```typescript
import { useTranslation } from "@orderly.network/i18n";

function MyComponent() {
  const { t } = useTranslation();
  return <span>{t("common.cancel")}</span>;
}
```
