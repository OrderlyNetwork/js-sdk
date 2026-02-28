# utils

## Overview

Utilities for mapping browser language to locale codes and for locale-prefixed paths: parse browser language, strip or read locale prefix from pathname, and build localized paths with optional search params.

## Exports

### `parseI18nLang(lang, localeCodes?, defaultLang?)`

Maps a browser language string (e.g. `en-US`, `zh-CN`) to a supported locale code.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lang` | `string` | Yes | Browser language (e.g. `navigator.language`) |
| `localeCodes` | `LocaleCode[]` | No | Allowed codes; default `Object.values(LocaleEnum)` |
| `defaultLang` | `LocaleCode` | No | Fallback; default `LocaleEnum.en` |

Returns the matching `LocaleCode` or `defaultLang`. Uses the first two-letter match if full `lang` is not in `localeCodes`.

**Examples:** `parseI18nLang('en-US')` → `'en'`, `parseI18nLang('zh-CN')` → `'zh'`, `parseI18nLang('ja')` → `'ja'`.

### `removeLangPrefix(pathname, localeCodes?)`

Removes a leading locale segment from `pathname` if it matches a known locale.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pathname` | `string` | Yes | Pathname (e.g. `/en/perp/PERP_ETH_USDC`) |
| `localeCodes` | `string[]` | No | Default `Object.values(LocaleEnum)` |

**Examples:** `removeLangPrefix('/en/perp/PERP_ETH_USDC')` → `'/perp/PERP_ETH_USDC'`, `removeLangPrefix('/markets')` → `'/markets'`.

### `getLocalePathFromPathname(pathname, localeCodes?)`

Returns the first path segment if it is a supported locale, else `null`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pathname` | `string` | Yes | Pathname |
| `localeCodes` | `string[]` | No | Default `Object.values(LocaleEnum)` |

**Examples:** `getLocalePathFromPathname('/en/markets')` → `'en'`, `getLocalePathFromPathname('/markets')` → `null`.

### `generatePath(params)`

Builds a path with locale prefix and optional search. If `path` already has a valid locale prefix, it is left as-is and only `search` is appended. Otherwise the locale (from `params.locale` or current i18n language) is prepended.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params.path` | `string` | Yes | Base path (e.g. `/markets`, `/perp/PERP_ETH_USDC`) |
| `params.locale` | `string` | No | Locale prefix; default from `i18n.language` |
| `params.search` | `string` | No | Query string; default `window.location.search` |

**Examples:** `generatePath({ path: '/markets' })` → `'/en/markets?tab=spot'` (if search present); `generatePath({ path: '/en/markets', search: '?tab=futures' })` → `'/en/markets?tab=futures'`.

## Usage example

```typescript
import {
  parseI18nLang,
  removeLangPrefix,
  getLocalePathFromPathname,
  generatePath,
} from "@orderly.network/i18n";

const code = parseI18nLang(navigator.language);
const pathWithoutLocale = removeLangPrefix(location.pathname);
const pathWithLocale = generatePath({ path: "/markets", locale: "zh" });
```
