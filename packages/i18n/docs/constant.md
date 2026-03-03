# constant

## Overview

Locale-related constants: supported locale enum, default language list with display names, default namespace, and storage keys used by the language detector.

## Exports

### `LocaleEnum` (enum)

Supported locale codes and their string values.

| Member | Value | Description |
|--------|-------|-------------|
| `en` | `"en"` | English |
| `zh` | `"zh"` | Chinese |
| `ja` | `"ja"` | Japanese |
| `es` | `"es"` | Spanish |
| `ko` | `"ko"` | Korean |
| `vi` | `"vi"` | Vietnamese |
| `de` | `"de"` | German |
| `fr` | `"fr"` | French |
| `ru` | `"ru"` | Russian |
| `id` | `"id"` | Indonesian |
| `tr` | `"tr"` | Turkish |
| `it` | `"it"` | Italian |
| `pt` | `"pt"` | Portuguese |
| `uk` | `"uk"` | Ukrainian |
| `pl` | `"pl"` | Polish |
| `nl` | `"nl"` | Dutch |
| `tc` | `"tc"` | Traditional Chinese |

### `defaultLanguages`

`Language[]` – list of `{ localCode, displayName }` for the locales above (e.g. English, 中文, 日本語).

### `defaultLng`

`LocaleEnum.en` – default locale when none is detected.

### `defaultNS`

`"translation"` – default i18next namespace.

### `i18nLocalStorageKey`

`"orderly_i18nLng"` – key used by the language detector in localStorage.

### `i18nCookieKey`

`"orderly_i18nLng"` – key used by the language detector in cookies (preferred-language).

## Usage example

```typescript
import {
  LocaleEnum,
  defaultLanguages,
  defaultLng,
  defaultNS,
  i18nLocalStorageKey,
  i18nCookieKey,
} from "@orderly.network/i18n";
```
