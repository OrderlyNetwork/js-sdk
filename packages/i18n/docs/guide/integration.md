# Integration Guide

**This guide** documents props, effects, and loading strategies. For **end-to-end copy-paste recipes** (Vite `import.meta.glob`, Next.js/webpack, HTTP `public/`, sync maps, URL sync), use [Examples](./examples.md).

**Overview:** `LocaleProvider` composes `**LanguageProvider`** (language list, optional HTTP `Backend`, change callbacks) and `**I18nextProvider`** from react-i18next. All of it uses the package’s **singleton `i18n`instance**. The default namespace is`**translation`** (`defaultNS`); see [Package exports](./exports.md).

Follow the steps below to integrate localization in your app with the Orderly SDK.

## Table of Contents

- [1. Wrap Your App with LocaleProvider](#1-wrap-your-app-with-localeprovider)
- [2. Provide Locale Data](#2-provide-locale-data)
- [3. Extending Locale Files](#3-extending-locale-files)
- [4. Integrate External Resources](#4-integrate-external-resources)

## 1. Wrap Your App with LocaleProvider

`LocaleProvider` is the main entry: it wires locale state and the i18n React context. Wrap your app (or orderly subtree) at the root.

```tsx
import { LocaleProvider } from "@orderly.network/i18n";

export function App() {
  return (
    <LocaleProvider>
      <YourApp />
    </LocaleProvider>
  );
}
```

### Locale-only props

These props are defined on `LocaleProvider` (see `localeProvider.tsx`):

| Prop        | Description                                                                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`    | Optional **controlled** locale. When set and different from `i18n.language`, a `useEffect` calls `i18n.changeLanguage(locale)`.                                                                                                                    |
| `resource`  | Flat messages for `**defaultNS`** (`translation`). Used only when `**resources`is not set**; requires`locale`. Calls `i18n.addResourceBundle(locale, defaultNS, resource, true, true)`.                                                            |
| `resources` | Static **Resources** map or **AsyncResources**. When set, **registerResources** runs in a `useEffect` (see **Behavior**). Takes precedence over `locale` + `resource`. Same contract as `ExternalLocaleProvider` / `useRegisterExternalResources`. |

**Async loader and `ns`:** The `AsyncResources` type is `(lang, ns) => Promise<Record<string, string>>`. When loading goes through `**registerResources`** (from `LocaleProvider` or `useRegisterExternalResources`), the implementation calls `**await resources(localeCode, defaultNS)`** — the second argument is **always** `defaultNS` (`translation`), not an arbitrary namespace. Use the parameter if you build URLs; for multiple i18n namespaces, use the i18n API directly.

### Inherited from `LanguageProvider`

Pass these through `LocaleProvider` like any other `LanguageProvider` prop:

| Prop                      | Description                                                                                                                                                                                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend`                 | `BackendOptions`: `{ loadPath }` where `loadPath(lang, ns)` returns a URL `string`, `string[]`, or `undefined` for the HTTP `Backend`. Those URLs must resolve to real files (e.g. under `public/`); the package does **not** copy `dist/locales` into your app — sync manually or via a script / hook — see [HTTP backend](./examples.md#http-backend). |
| `languages`               | Full `Language[]` for the switcher; when set as an array, replaces `defaultLanguages`.                                                                                                                                                                                                                                                                   |
| `supportedLanguages`      | Subset of `LocaleCode[]`; builds the list from `**defaultLanguages**` entries.                                                                                                                                                                                                                                                                           |
| `onLanguageBeforeChanged` | `(lang) => Promise<void>`. **Runs first**; then the internal `Backend` loads the next language (`loadLanguage(lang, defaultNS)`). Use for prep work before HTTP loads.                                                                                                                                                                                   |
| `onLanguageChanged`       | `(lang) => Promise<void>` — notification on the language-change path.                                                                                                                                                                                                                                                                                    |
| `convertDetectedLanguage` | `(browserLang: string) => LocaleCode` — optional mapping from the detector to your supported codes.                                                                                                                                                                                                                                                      |
| `popup`                   | `PopupProps` for the language switcher: optional `mode` (`modal`, `dropdown`, or `sheet`), `className`, `style`.                                                                                                                                                                                                                                         |

### Behavior (effects)

- `**resources` set:\*\* `registerResources(resources, locale ?? currentLocale)` runs when `locale`, `resource`, `resources`, or the current locale from `useLocaleCode` changes. Static maps register every locale entry; async loaders fetch for the active locale code.
- `**resources` unset** and `**resource`+`locale`:** merges the flat bundle for that locale into `defaultNS`.
- `**locale` prop:\*\* separate effect — if `locale` is set and differs from `i18n.language`, `i18n.changeLanguage(locale)` runs.

Prefer **one** primary loading approach per app (**HTTP `backend`** vs **static/async `resources`** vs `**locale` + `resource**`) to avoid overlapping bundles. You can pass `**resources` on `LocaleProvider**` instead of `ExternalLocaleProvider` — same registration path. Use `**useRegisterExternalResources**` to avoid an extra wrapper (stable `resources` reference recommended).

### Loading strategies (quick reference)

- **HTTP:** `backend={{ loadPath }}` — load JSON from URLs (e.g. files under `public/`). You must **place** those JSON files on disk (or CDN): **manually** copy from `node_modules/.../i18n/dist/locales`, or run a **copy script** / **Husky** hook (`npm run copyLocales`, etc.) as in [HTTP backend](./examples.md#http-backend).
- **Bundled:** `resources` as a static map or **`AsyncResources`**. Recipes: [Async resources (Vite)](./examples.md#async-resources-vite) · [Async resources (Next.js and webpack)](./examples.md#async-resources-nextjs-and-webpack) · [Sync resources](./examples.md#sync-resources).
- **Controlled single bundle:** `locale` + `resource` when you inject one flat table for one language.
- **Host / external bundles:** `ExternalLocaleProvider` or `useRegisterExternalResources` — same `Resources` / `AsyncResources` as `LocaleProvider.resources`.

## 2. Provide Locale Data

### Default language

- English (`en`) ships with the package as the built-in base bundle.

### Supported locales

We currently support **17** locales. The table order matches `**defaultLanguages`\*\* in the package (`constant`).

| Locale Code | Language            |
| ----------- | ------------------- |
| `en`        | English             |
| `zh`        | Chinese             |
| `ja`        | Japanese            |
| `es`        | Spanish             |
| `ko`        | Korean              |
| `vi`        | Vietnamese          |
| `de`        | German              |
| `fr`        | French              |
| `ru`        | Russian             |
| `id`        | Indonesian          |
| `tr`        | Turkish             |
| `it`        | Italian             |
| `pt`        | Portuguese          |
| `uk`        | Ukrainian           |
| `pl`        | Polish              |
| `nl`        | Dutch               |
| `tc`        | Traditional Chinese |

### CSV for translation workflows

- Releases include a `dist/locale.csv` you can hand off for translation.
- Use the [CLI](./cli.md) to convert between CSV and JSON (`csv2json`, `json2csv`, etc.).

## 3. Extending locale files

You can translate SDK strings and add strings for your own UI.

- Use the `**extend.`\*\* key prefix for custom keys so they stay distinct from built-in keys (and align with tooling such as `separateJson` in the [CLI](./cli.md)).

```json
{
  "extend.custom.button.label": "My Custom Button"
}
```

## 4. Integrate external resources

Use this when strings live outside this package (another bundle, CDN, or host app). `**LocaleProvider**` with `**resources**`, `**ExternalLocaleProvider**`, and `**useRegisterExternalResources**` all call the same `**registerResources**` helper.

The snippets below are **minimal** (wrapper vs hook). [Examples](./examples.md) uses **`LocaleProvider` + `resources`** with full app wiring (e.g. merge SDK + extend, provider tree)—use that for production-shaped code.

For **Vite**, bundling SDK locales with your `extend` JSON via `**AsyncResources`\*\* is the recommended setup — see [Async resources (Vite)](./examples.md#async-resources-vite).

### `ExternalLocaleProvider`

- **Async:** `(lang, ns) => Promise<Record<string, string>>` — invoked when the locale changes (same `ns` behavior as above when used through `registerResources`).
- **Sync:** static `Resources` map; all listed locales are registered on mount.

Async example:

```tsx
import {
  AsyncResources,
  ExternalLocaleProvider,
  LocaleCode,
  LocaleProvider,
} from "@orderly.network/i18n";

const resources: AsyncResources = async (lang: LocaleCode) => {
  return import(`./locales/${lang}.json`).then(
    (res) => res.default as Record<string, string>,
  );
};

export function App() {
  return (
    <LocaleProvider>
      <ExternalLocaleProvider resources={resources}>
        <YourApp />
      </ExternalLocaleProvider>
    </LocaleProvider>
  );
}
```

Sync example:

```tsx
import {
  ExternalLocaleProvider,
  LocaleProvider,
  Resources,
} from "@orderly.network/i18n";

const resources: Resources = {
  en: { "extend.host.title": "Host app title" },
  zh: { "extend.host.title": "宿主应用标题" },
};

export function App() {
  return (
    <LocaleProvider>
      <ExternalLocaleProvider resources={resources}>
        <YourApp />
      </ExternalLocaleProvider>
    </LocaleProvider>
  );
}
```

`ExternalLocaleProvider` renders only its children (no UI).

### `useRegisterExternalResources`

Same registration as above, without a wrapper component — call under `LocaleProvider` with a **stable** `resources` reference (`useCallback` for loaders, module scope or `useMemo` for maps):

```tsx
import {
  LocaleProvider,
  useRegisterExternalResources,
} from "@orderly.network/i18n";
import type { AsyncResources, LocaleCode } from "@orderly.network/i18n";

const loader: AsyncResources = async (lang: LocaleCode) => {
  return import(`./locales/${lang}.json`).then(
    (res) => res.default as Record<string, string>,
  );
};

function Bridge() {
  useRegisterExternalResources(loader);
  return null;
}
```

### `registerDefaultResource`

Call **before** the React tree mounts (e.g. app bootstrap) to merge keys into the **English** bundle and reduce flicker of raw keys. It uses `i18n.addResourceBundle(defaultLng, defaultNS, messages, true, true)` (deep merge with overwrite), same as other bundle registration paths:

```ts
import { registerDefaultResource } from "@orderly.network/i18n";

registerDefaultResource({
  "extend.app.loading": "Loading...",
  "extend.app.title": "Orderly App",
});
```

See also: [Package exports](./exports.md) · [Utils](./utils.md) · [CLI](./cli.md) · [Examples](./examples.md) ([Vite](./examples.md#async-resources-vite) · [Next/webpack](./examples.md#async-resources-nextjs-and-webpack) · [HTTP](./examples.md#http-backend) · [URL sync](./examples.md#onlanguagechanged-url-sync))
