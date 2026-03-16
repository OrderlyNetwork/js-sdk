# provider

## Overview

React providers for i18n and locale: `I18nProvider` wraps `I18nextProvider` with optional props; `LocaleProvider` wires resources, backend loading, language detection, and locale context (languages list, onLanguageBeforeChanged, onLanguageChanged, popup options) for the language switcher.

## Exports

### `I18nProviderProps`

`Partial<I18nextProviderProps>` – optional props passed to `I18nextProvider`.

### `I18nProvider`

Functional component that renders `I18nextProvider` with given props and `children`. Use when you only need to pass a custom i18n instance or props.

### `LocaleProviderProps`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Tree to wrap |
| `locale` | `LocaleCode` | No | Initial/controlled language |
| `resource` | `Record<string, string>` | No | Single locale messages (use with `locale`) |
| `resources` | `Resources` | No | Per-locale messages; overrides `resource`/`locale` for initial data |
| `supportedLanguages` | `LocaleCode[]` | No | Subset of languages for the switcher (from default list) |
| `onLocaleChange` | `(locale: LocaleCode) => void` | No | Deprecated; use `onLanguageChanged` |
| `onLanguageChanged` | `(locale: LocaleCode) => void \| Promise<void>` | No | Called after language change |
| `onLanguageBeforeChanged` | `(locale: LocaleCode) => Promise<void>` | No | Called before change; backend loads language in this callback |
| `convertDetectedLanguage` | `(lang: string) => LocaleCode` | No | Map detected language to a supported code |
| `backend` | `BackendOptions` | No | Used to create internal `Backend` for loading languages |
| `languages` | `Language[]` | No | Custom language list for context |
| `popup` | `PopupProps` | No | Language switcher popup options |

### `LocaleProvider`

- Merges `resource`/`locale` or `resources` into i18n on mount/update.
- When `locale` is set, calls `i18n.changeLanguage(locale)`.
- Builds `languages` from `supportedLanguages` or `props.languages`.
- On init, uses `convertDetectedLanguage` or `parseI18nLang` to resolve language, loads it via `Backend`, then calls `i18n.changeLanguage` if needed.
- Provides `LocaleContext` with `languages`, `onLanguageBeforeChanged` (loads language via backend), `onLanguageChanged`, and `popup`.
- Renders `I18nextProvider` with the shared i18n instance and `defaultNS`.

## Usage example

```tsx
import { LocaleProvider, I18nProvider } from "@orderly.network/i18n";

<LocaleProvider
  backend={{
    loadPath: (lng, ns) => `https://cdn.example.com/locales/${lng}/${ns}.json`,
  }}
  supportedLanguages={["en", "zh", "ja"]}
  onLanguageChanged={(lng) => console.log(lng)}
>
  <App />
</LocaleProvider>
```
