# @orderly.network/i18n

Internationalization and cli tools for Orderly SDK. Based on i18next ecosystem.

## Integration

### 1. Wrap LocaleProvider

The LocaleProvider is the core component that provides locale resources to your app. You must wrap you app with LocaleProvider.

### 2. Provide Resources

- By default, English (en) is included.
- If you want to support other languages besides English, you need to explicitly import it from the i18n package and pass it to the resources prop of LocaleProvider.
- Currently, we provider English (en) and Chinese (zh) locale files.
- You can also extend the built-in messages by merging them with your own locale files.
- With each release we will generate csv files (dist/locale.csv) for easy translation and we provide a cli to convert between csv and json files.
- It can translate not only the ui in the SDK, but also other components you write outside of the SDK.

### Example

Here’s a complete example of how to set up the i18n integration:

```typescript
import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import {
  LocaleProvider,
  Resources,
  LocaleCode,
  zh,
} from "@orderly.network/i18n";

// extend or overrides English translations
const extendEn = {
  "extend.trading": "Trading",
};

// extend or overrides chinese translations
const extendZh = {
  "extend.trading": "交易",
};

type ExtendLocaleMessages = typeof extendEn;

// define language resources
const resources: Resources<ExtendLocaleMessages> = {
  en: extendEn,
  zh: {
    ...zh,
    ...extendZh,
  },
};

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  const onLocaleChange = (locale: LocaleCode) => {};

  return (
    <LocaleProvider resources={resources} onLocaleChange={onLocaleChange}>
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

### Add more languages

We also support adding more custom languages

```typescript
import { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import {
  LocaleProvider,
  Resources,
  zh,
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
  en,
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
  const onLocaleChange = (locale: LocaleCode) => {};

  return (
    <LocaleProvider
      resources={resources}
      languages={languages}
      onLocaleChange={onLocaleChange}
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
npx @orderly.network/i18n csv2json ./dist/locale.csv ./dist/locale
```

### json2csv

Convert multiple locale JSON files to a single locale CSV file.

```bash
npx @orderly.network/i18n json2csv <input> <output>
```

Example:

```bash
npx @orderly.network/i18n json2csv ./dist/locale/en.json,./dist/locale/zh.json ./dist/locale.csv
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

Generate a locale CSV file from your source files.

```bash
npx @orderly.network/i18n generateCsv <output>
```

Example:

```bash
npx @orderly.network/i18n generateCsv ./dist/locale.csv
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
