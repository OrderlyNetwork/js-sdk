# @orderly.network/i18n

## Overview

This package provides internationalization (i18n) for the Orderly ecosystem. It is built on `i18next` and `react-i18next`, with locale detection, backend loading, and React providers for language switching and translation.

## Directory structure

| Directory / File | Description |
|-----------------|-------------|
| [locale](./locale/index.md) | Locale message modules (en and per-module namespaces) |
| [backend](./backend.md) | Backend for loading translation resources from URLs |
| [constant](./constant.md) | Locale enum, default languages, storage keys |
| [context](./context.md) | Locale context and types for language switcher |
| [i18n](./i18n.md) | i18next instance and configuration |
| [provider](./provider.md) | I18nProvider and LocaleProvider components |
| [types](./types.md) | LocaleMessages, Resources, LocaleCode types |
| [useLocaleCode](./useLocaleCode.md) | Hook to subscribe to current locale code |
| [useTranslation](./useTranslation.md) | Wrapper around react-i18next useTranslation |
| [utils](./utils.md) | parseI18nLang, path helpers for locale-prefixed routes |
| [version](./version.md) | Package version (exposed on window) |

## Top-level exports

The package re-exports from `react-i18next` and `i18next`, and adds:

- `i18n`, `createInstance` – i18n instance and factory
- `I18nProvider`, `LocaleProvider` – React providers
- `useTranslation`, `useLocaleCode` – hooks
- `LocaleContext`, `useLocaleContext` – context for language switcher
- Types: `LocaleCode`, `LocaleMessages`, `Resources`, `Language`, `LocaleProviderProps`, etc.
- Constants: `LocaleEnum`, `defaultLanguages`, `defaultNS`, `i18nLocalStorageKey`, `i18nCookieKey`
- Utilities: `parseI18nLang`, `removeLangPrefix`, `getLocalePathFromPathname`, `generatePath`
- English locale: `en` object from `./locale/en`
