# backend

## Overview

Async backend for loading translation resources by language and namespace. Uses a configurable `loadPath` to fetch JSON and adds bundles to the shared i18n instance. Caches loaded URLs to avoid duplicate requests.

## Exports

### `BackendOptions`

| Property | Type | Description |
|----------|------|-------------|
| `loadPath` | `(lang: LocaleCode, ns: string) => string \| string[] \| undefined` | Returns URL(s) to fetch for the given language and namespace |

### `Backend` (class)

Backend that loads resources via `loadPath` and registers them with `i18n.addResourceBundle`.

| Member | Type | Description |
|--------|------|-------------|
| `options` | `BackendOptions` | Constructor options |
| `cache` | `Set<string>` | URLs already loaded |
| `constructor(options)` | | Accepts `BackendOptions` |
| `fetchData(url: string)` | `Promise<object>` | Fetches JSON from `url`; returns `{}` on error |
| `loadLanguage(lang, ns)` | `Promise<void>` | Resolves path(s) via `loadPath`, fetches, adds bundles; skips if already in cache and bundle exists |

## Usage example

```typescript
import { Backend } from "@orderly.network/i18n";

const backend = new Backend({
  loadPath: (lang, ns) => `https://cdn.example.com/locales/${lang}/${ns}.json`,
});

await backend.loadLanguage("zh", "translation");
```
