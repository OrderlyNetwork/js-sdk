# context

## Overview

React context for the language switcher: supported languages list, callbacks for before/after language change, and popup options (modal, dropdown, sheet). Consumed by `LocaleProvider` and UI that switches locale.

## Exports

### `Language`

| Property | Type | Description |
|----------|------|-------------|
| `localCode` | `LocaleCode` | Locale code (e.g. `en`, `zh`) |
| `displayName` | `string` | Display name (e.g. "English", "中文") |

### `PopupMode`

`"modal" | "dropdown" | "sheet"` – how the language switcher popup is shown.

### `PopupProps`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `mode` | `PopupMode` | No | Default `"modal"` |
| `className` | `string` | No | Popup class name |
| `style` | `React.CSSProperties` | No | Popup style |

### `LocaleContextState`

| Property | Type | Description |
|----------|------|-------------|
| `languages` | `Language[]` | Custom/supported languages for the switcher |
| `onLanguageBeforeChanged` | `(lang: LocaleCode) => Promise<void>` | Called before language change (e.g. load resources) |
| `onLanguageChanged` | `(lang: LocaleCode) => Promise<void>` | Called after language change |
| `popup` | `PopupProps \| undefined` | Options for the language switcher popup |

### `LocaleContext`

`React.createContext<LocaleContextState>` – default value has empty `languages` and no-op promises for the callbacks.

### `useLocaleContext()`

Returns `useContext(LocaleContext)`.

## Usage example

```typescript
import { useLocaleContext, type Language } from "@orderly.network/i18n";

function LanguageSwitcher() {
  const { languages, onLanguageBeforeChanged, onLanguageChanged } = useLocaleContext();
  // Render list of languages and call callbacks on select
}
```
