# @orderly.network/i18n

Internationalization and CLI tools for Orderly SDK. Based on i18next ecosystem.

**Quick start:** Install the package, wrap your app root with `LocaleProvider`, and you get English by default. For multiple locales or custom keys, see the sections below.

## Table of Contents

- [Integration Guide](#integration-guide)
  - [Wrap Your App with LocaleProvider](#1-wrap-your-app-with-localeprovider)
  - [Provide Locale Data](#2-provide-locale-data)
  - [Extending Locale Files](#3-extending-locale-files)
  - [Integrate External Resources](#4-integrate-external-resources)
- [Package exports](#package-exports)
- [Example](#example)
  - [Async load locale files](#async-load-locale-files)
  - [Sync load locale data](#sync-load-locale-data)
  - [Add custom languages](#add-custom-languages)
- [CLI](#cli)
  - [Usage](#usage)
  - [Commands](#commands)

## Package exports

| Export                             | Description                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `@orderly.network/i18n`            | Main entry: `LocaleProvider`, `ExternalLocaleProvider`, `registerDefaultResource`, hooks, types |
| `@orderly.network/i18n/locales/`\* | Built-in locale JSON files                                                                      |
| `@orderly.network/i18n/constant`   | Constants (e.g. `LocaleEnum`)                                                                   |
| `@orderly.network/i18n/utils`      | Utility functions                                                                               |

**Hooks:** `useTranslation`, `useLocaleCode`, and `useRegisterExternalResources` are exported from the main entry; use them as with react-i18next and the locale context (see type definitions or `docs/` for details).

## Integration Guide

Follow these steps to integrate localization support in your app using Orderly SDK:

### 1. Wrap Your App with LocaleProvider

The LocaleProvider is the core component that supplies localized resources to your application. Make sure to wrap your app’s root component with LocaleProvider.

```tsx
import { LocaleProvider } from "@orderly.network/i18n";

<LocaleProvider>
  <YourApp />
</LocaleProvider>;
```

### 2. Provide Locale Data

#### Default Language

- English (`en`) is included by default.

#### Supported Locales

We currently support **17 locales**

| Locale Code | Language            |
| ----------- | ------------------- |
| `en`        | English             |
| `zh`        | Chinese             |
| `tc`        | Traditional Chinese |
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

#### CSV for Easy Translation

- Each release generates a `dist/locale.csv` file to simplify translation workflows.
- We provide a CLI tool to convert between CSV and JSON formats.

### 3. Extending Locale Files

You can localize both the SDK UI and your own custom components.

- When adding custom keys, prefix them with `extend.` to avoid conflicts with default keys.

```json
{
  "extend.custom.button.label": "My Custom Button"
}
```

### 4. Integrate External Resources

In more advanced setups, your translations may live outside of this package (for example, in another bundle, a backend service, or a host application). For these cases, use `ExternalLocaleProvider` or `useRegisterExternalResources` from the main package.

#### ExternalLocaleProvider

`ExternalLocaleProvider` lets you register translation resources that come from an external source. It supports both **async** and **sync** resource injection:

- **Async mode**: pass a function `(lang, ns) => Promise<Record<string, string>>`. It will be called whenever the locale changes, and the returned messages will replace the in-memory bundle for that locale/namespace.
- **Sync mode**: pass a static `Resources` map, similar to `LocaleProvider.resources`, and all bundles will be registered on mount.

Async example (resources fetched from a host app or backend):

```tsx
import {
  AsyncResources,
  ExternalLocaleProvider,
  LocaleCode,
  LocaleProvider,
} from "@orderly.network/i18n";

const loadExternalMessages: AsyncResources = async (
  lang: LocaleCode,
  ns: string,
) => {
  // fetch translations from your host app, CDN, or backend
  const res = await fetch(`/i18n/${lang}/${ns}.json`);
  return (await res.json()) as Record<string, string>;
};

export function App() {
  return (
    <LocaleProvider>
      <ExternalLocaleProvider resources={loadExternalMessages}>
        <YourApp />
      </ExternalLocaleProvider>
    </LocaleProvider>
  );
}
```

Sync example (host app provides a static map of messages):

```tsx
import {
  ExternalLocaleProvider,
  LocaleProvider,
  Resources,
} from "@orderly.network/i18n";

const externalResources: Resources = {
  en: {
    "extend.host.title": "Host app title",
  },
  zh: {
    "extend.host.title": "宿主应用标题",
  },
};

export function App() {
  return (
    <LocaleProvider>
      <ExternalLocaleProvider resources={externalResources}>
        <YourApp />
      </ExternalLocaleProvider>
    </LocaleProvider>
  );
}
```

`ExternalLocaleProvider` renders no UI; it only manages i18n side effects and simply returns its children.

The same registration logic is available as a hook if you prefer not to add an extra wrapper component:

```tsx
import {
  LocaleProvider,
  useRegisterExternalResources,
  type AsyncResources,
  type LocaleCode,
} from "@orderly.network/i18n";

const loadExternalMessages: AsyncResources = async (
  lang: LocaleCode,
  ns: string,
) => {
  const res = await fetch(`/i18n/${lang}/${ns}.json`);
  return (await res.json()) as Record<string, string>;
};

function HostI18nBridge() {
  useRegisterExternalResources(loadExternalMessages);
  return null;
}

// Inside <LocaleProvider>: render <HostI18nBridge /> (or call the hook in an existing child).
```

#### Register default resources

`registerDefaultResource` registers the default language bundle before your React tree renders, which helps avoid a brief flash of raw translation keys:

```ts
import { registerDefaultResource } from "@orderly.network/i18n";

// typically run once during app bootstrap
registerDefaultResource({
  "extend.app.loading": "Loading...",
  "extend.app.title": "Orderly App",
});
```

It uses a deep merge with overwrite semantics, so subsequent calls will keep the in-memory bundle in sync with your external source of truth.

## Example

You can load locale data in three ways: **async** via `backend.loadPath` (e.g. from your `public/locales`), **sync** by passing preloaded `resources`, or **custom** by defining a `languages` list and per-locale resources.

### Async load locale files

```typescript
import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { LocaleProvider, LocaleEnum, LocaleCode } from "@orderly.network/i18n";

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  const onLanguageChanged = async (lang: LocaleCode) => {};

  // please copy build-in locale files (@orderly.network/i18n/locales) to you public/locales
  // and copy you extend locale files to public/locales/extend
  const loadPath = (lang: LocaleCode) => {
    if (lang === LocaleEnum.en) {
      // because en is built-in, we need to load the en extend only
      return `/locales/extend/${lang}.json`;
    }
    return [`/locales/${lang}.json`, `/locales/extend/${lang}.json`];
  };

  return (
    <LocaleProvider
      onLanguageChanged={onLanguageChanged}
      backend={{ loadPath }}
    >
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          {props.children}
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </LocaleProvider>
  );
};
```

### Sync load locale data

Use this when you bundle locale JSON (e.g. import from `@orderly.network/i18n/locales/*`) and do not need async loading.

```typescript
import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { LocaleProvider, LocaleCode, Resources } from "@orderly.network/i18n";
import zh from "@orderly.network/i18n/locales/zh.json";
import ja from "@orderly.network/i18n/locales/ja.json";
import ko from "@orderly.network/i18n/locales/ko.json";

// extend or overrides English translations
const extendEn = {
  "extend.trading": "Trading",
};

// extend or overrides chinese translations
const extendZh = {
  "extend.trading": "交易",
};

// extend or overrides japanese translations
const extendJa = {
  "extend.trading": "取引",
};

// extend or overrides korean translations
const extendKo = {
  "extend.trading": "거래",
};

// define language resources
const resources: Resources = {
  en: extendEn,
  zh: {
    ...zh,
    ...extendZh,
  },
  ja: {
    ...ja,
    ...extendJa,
  },
  ko: {
    ...ko,
    ...extendKo,
  },
};

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  const onLanguageChanged = (locale: LocaleCode) => {};

  return (
    <LocaleProvider resources={resources} onLanguageChanged={onLanguageChanged}>
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          {props.children}
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </LocaleProvider>
  );
};
```

### Add custom languages

You can restrict the language list and provide only the locales you need via `languages` and `resources`.

```typescript
import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import {
  LocaleProvider,
  Resources,
  LocaleEnum,
  LocaleCode,
  Language,
} from "@orderly.network/i18n";

// japanese locale
const ja = {
  "extend.ja": "日本語",
};

// korean locale
const ko = {
  "extend.ko": "한국어",
};

// define language resources
const resources: Resources = {
  ja,
  ko,
};

// custom languages
const languages: Language[] = [
  { localCode: LocaleEnum.en, displayName: "English" },
  { localCode: LocaleEnum.ja, displayName: "日本語" },
  { localCode: LocaleEnum.ko, displayName: "한국어" },
];

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  const onLanguageChanged = (locale: LocaleCode) => {};

  return (
    <LocaleProvider
      resources={resources}
      languages={languages}
      onLanguageChanged={onLanguageChanged}
    >
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          {props.children}
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </LocaleProvider>
  );
};
```

## CLI

### Usage

```bash
npx @orderly.network/i18n <command> [options]
```

The CLI manages locale files: CSV/JSON conversion, diff, merge, and key filtering. Commands are listed below.

### Commands

### csv2json

Convert a locale CSV file to multiple locale JSON files.

```bash
npx @orderly.network/i18n csv2json <input> <outputDir>
```

Example:

```bash
npx @orderly.network/i18n csv2json ./dist/locale.csv ./dist/locales
```

### json2csv

Convert multiple locale JSON files from any directory into a single locale CSV file (generic JSON → CSV).

```bash
npx @orderly.network/i18n json2csv <inputDir> <output>
```

Example:

```bash
npx @orderly.network/i18n json2csv ./locales ./dist/locale.csv
```

### diffcsv

Compare two locale CSV files to find differences.

```bash
npx @orderly.network/i18n diffcsv <oldFile> <newFile>
```

Example:

```bash
npx @orderly.network/i18n diffcsv ./dist/locale1.csv ./dist/locale2.csv
```

### generateCsv

Generate a locale CSV file from locale JSON files. Typically used for the package’s own `locales` directory (e.g. when building or releasing).

```bash
npx @orderly.network/i18n generateCsv <inputDir> <output>
```

Example:

```bash
npx @orderly.network/i18n generateCsv ./locales ./dist/locale.csv
```

### fillJson

Build a new locale JSON with the same keys as the built-in English set, filling values from the input file (missing keys become empty). Useful for filling missing keys in a locale from another language or template.

```bash
npx @orderly.network/i18n fillJson <input> <output>
```

Example:

```bash
npx @orderly.network/i18n fillJson ./src/locale/zh.json ./dist/locale/zh.json
```

### separateJson

Split each locale JSON by key prefix: keys starting with `separateKey.` go into an `extend/` subdirectory under `outputDir`, the rest stay at the root of `outputDir`.

```bash
npx @orderly.network/i18n separateJson <inputDir> <outputDir> <separateKey>
```

Example:

```bash
npx @orderly.network/i18n separateJson ./locales ./dist/locales extend
```

### mergeJson

Merge default and extend JSON files from a single input directory into one file per locale. The input directory must contain both the main locale JSON files and an `extend/` subdirectory with matching locale files; merged output is written to `outputDir`.

```bash
npx @orderly.network/i18n mergeJson <inputDir> <outputDir>
```

Example:

```bash
npx @orderly.network/i18n mergeJson ./locales ./dist/locales
```

### filterKeys

Filter locale JSON keys by prefix: keep only keys matching the prefix, or remove keys matching the prefix. Operates on `packages/i18n/locales` by default (or a custom directory via `--locales-dir`). You must specify exactly one of `--keep` or `--remove`.

```bash
npx @orderly.network/i18n filterKeys (--keep | -k | --remove | -r) --prefix <prefix> [--locales-dir <dir>]
```

Options:

- `--keep`, `-k` — Keep only keys that start with the given prefix.
- `--remove`, `-r` — Remove keys that start with the given prefix.
- `--prefix <prefix>` — (Required) Key prefix to match (e.g. `trading.` or `trading`).
- `--locales-dir <dir>` — Directory containing locale JSON files (default: `packages/i18n/locales`).

Examples:

```bash
# Keep only keys with prefix "trading."
npx @orderly.network/i18n filterKeys --keep --prefix trading.

# Remove keys with prefix "trading." (short form)
npx @orderly.network/i18n filterKeys -r --prefix trading.

# Use a custom locales directory
npx @orderly.network/i18n filterKeys -k --prefix extend. --locales-dir ./my-locales
```
