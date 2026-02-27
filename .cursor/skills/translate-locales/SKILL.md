---
name: translate-locales
description: Generate extend/en.json, translate it into 16 locales, and merge into main locale JSON files.
---

## Translate Locales

When the user explicitly invokes this skill (e.g. `@translate-locales`), follow this 4-step workflow to generate and translate i18n locale files.

### Usage

- This skill is designed **only** for the batch workflow of generating new extend i18n keys under `packages/i18n` and translating them into multiple locales for the DApp.
- Use this skill **only** when the user explicitly asks to generate and translate extend i18n keys for the DApp (e.g. `@translate-locales` or by name).
- Do **not** use this skill for general translation requests, ad-hoc string translation, or refactoring existing i18n keys.

## Workflow

All shell commands below assume you are in the repo root first, and then inside the `packages/i18n` directory. Unless otherwise specified, commands are run from `packages/i18n`.

### Step 1 – Navigate

- From the repo root, if the current directory is not `packages/i18n`, run `cd packages/i18n`. If already in `packages/i18n`, skip.

### Step 2 – Generate extend en.json

- In `packages/i18n`, run: `pnpm generateMissingKeys`
- This creates `locales/extend/en.json` in the current `packages/i18n` directory, containing keys that are empty or invalid in other locales, using the English values from `en.json` as the translation source. If `extend/en.json` is empty or only contains `{}`, skip Steps 3–4 and inform the user that no new keys need translation.

### Step 3 – Translate from source file

Use the generated file `packages/i18n/locales/extend/en.json` (relative to the repo root, i.e. `locales/extend/en.json` under `packages/i18n`) as the translation source. Translate this source file into 16 languages. Create the output files in `packages/i18n/locales/extend/` (the same directory as `en.json`). If `packages/i18n/locales/extend/` already contains locale files with the same names, **overwrite** those files with the new translated JSON produced in this run (no need to manually clean the directory beforehand).

When asking the current AI to translate, use the prompt in `TRANSLATION_PROMPT.md`.

### Step 4 – Merge

In `packages/i18n`, run: `pnpm mergeExtendJson`. This merges each `locales/extend/<locale>.json` into `locales/<locale>.json` and then deletes the `locales/extend/` directory. After a successful run, `packages/i18n/locales/extend/` should no longer exist.

## Checklist

- [ ] In repo root, inside `packages/i18n`
- [ ] `pnpm generateMissingKeys` run; `packages/i18n/locales/extend/en.json` exists
- [ ] 16 locale files created under `packages/i18n/locales/extend/` with file names exactly matching the list in Step 3 (`zh.json`, `tc.json`, `ja.json`, `ko.json`, `vi.json`, `es.json`, `de.json`, `fr.json`, `ru.json`, `id.json`, `tr.json`, `it.json`, `pt.json`, `uk.json`, `pl.json`, `nl.json`)
- [ ] `pnpm mergeExtendJson` run successfully
- [ ] Main `packages/i18n/locales/<locale>.json` files updated and `packages/i18n/locales/extend/` removed
- [ ] Spot-check several languages to ensure placeholders, HTML tags, newlines, and token symbols are preserved correctly and that key sets match the English source.

## When NOT to use this skill

- The user only wants to translate a small number of ad-hoc strings or UI copy.
- The user is refactoring or renaming existing i18n keys rather than generating new extend keys.
- The task is general content translation unrelated to the DApp i18n JSON files.
