# @orderly.network/i18n

Internationalization and cli tools for Orderly SDK. Based on i18next ecosystem.

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

We currently support **8 locales**, located in the `dist/locales` directory:

| Locale Code | Language   |
| ----------- | ---------- |
| `en.json`   | English    |
| `zh.json`   | Chinese    |
| `ja.json`   | Japanese   |
| `es.json`   | Spanish    |
| `ko.json`   | Korean     |
| `vi.json`   | Vietnamese |
| `de.json`   | German     |
| `fr.json`   | French     |

> We plan to add more languages in future updates.

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

## Example

Here's a complete example of how to set up the i18n integration:

### Async load locale files

```typescript
import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { LocaleProvider, LocaleEnum, LocaleCode } from "@orderly.network/i18n";

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  const onLanguageChanged = async (lang: LocaleCode) => {};

  // please copy build-in locale files to you public/locales
  // and copy you extend locale files to public/locales/extend
  const loadPath = (lang: LocaleCode) => {
    const _lang = parseI18nLang(lang);
    if (_lang === LocaleEnum.en) {
      // because en is built-in, we need to load the en extend only
      return `/locales/extend/${_lang}.json`;
    }
    return [`/locales/${_lang}.json`, `/locales/extend/${_lang}.json`];
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

### Sync Load locale data

```typescript
import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { LocaleProvider, LocaleCode, Resources } from "@orderly.network/i18n";
import zh from "@orderly.network/i18n/locales/zh.json";

// extend or overrides English translations
const extendEn = {
  "extend.trading": "Trading",
};

// extend or overrides chinese translations
const extendZh = {
  "extend.trading": "交易",
};

// define language resources
const resources: Resources = {
  en: extendEn,
  zh: {
    ...zh,
    ...extendZh,
  },
};

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  const onLanguageChanged = (locale: LocaleCode) => {};

  return (
    <LocaleProvider resources={resources} onLanguageChanged={onLocaleChange}>
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

We also support adding more custom languages

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

## Usage

The package provides a CLI tool for managing Internationalization files.

```bash
npx @orderly.network/i18n <command> [options]
```

## Commands

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

Convert multiple locale JSON files to a single locale CSV file.

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

### fillJson

Fill values from an input locale JSON file and generate a new locale JSON file.

```bash
npx @orderly.network/i18n fillJson <input> <output>
```

Example:

```bash
npx @orderly.network/i18n fillJson ./src/locale/zh.json ./dist/locale/zh.json
```

### separateJson

Separate JSON files into default and extend key values based on a specified key.

```bash
npx @orderly.network/i18n separateJson <inputDir> <outputDir> <separateKey>
```

Example:

```bash
npx @orderly.network/i18n separateJson ./locales ./dist/locales extend
```

### mergeJson

Merge default and extend JSON files back into one file.

```bash
npx @orderly.network/i18n mergeJson <inputDir> <outputDir>
```

Example:

```bash
npx @orderly.network/i18n mergeJson ./dist/locales1 ./dist/locales2
```
