# @orderly.network/i18n

Internationalization and tools for Orderly SDK. Based on i18next ecosystem.

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
