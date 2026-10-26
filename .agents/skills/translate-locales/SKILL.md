---
name: translate-locales
description: Synchronize DApp translations for new or changed user-facing English keys across supported locales, using isolated batches and validated scoped merges. Runs automatically after copy changes or when explicitly requested.
---

# Translate Locales

Use for new keys and changes to existing English values in `packages/i18n/src/locale/module/`, including small copy edits. Follow AGENTS.md: run automatically within the same task without requesting confirmation, unless the user explicitly defers translation. General translation unrelated to this repository is outside this skill.

Run commands from `packages/i18n`. Use the scoped workflow below. Legacy `generateMissingKeys` and `mergeExtendJson` remain available for other callers but cannot detect English changes or protect a scoped merge.

## 1. Identify task keys and prepare

Read the current task's source changes and collect its exact new/modified keys. Include an existing key whenever its English value changes. Exclude changes belonging to other tasks in a shared working tree. For renamed keys, translate the new key; removal of the old key is a separate source change.

```bash
pnpm translation:prepare --keys prediction.message.example,prediction.otherKey
```

The script rebuilds canonical English from TypeScript. It compares selected keys against `HEAD:packages/i18n/locales/en.json`, so an already regenerated working-tree `en.json` does not hide an English change. If HEAD does not represent the pre-change English source (e.g. changes were already committed), pass `--baseline /absolute/path/to/pre-change-en.json`. Use a saved pre-edit snapshot when available; never invent old values. Without a usable baseline, report the missing baseline for changed keys instead of claiming they are synchronized.

Existing keys with changed English values are retranslated in all non-English locales. For new or unchanged keys, only missing/invalid translations are targeted, including placeholder/token mismatches; valid existing translations are retained. Locales come from `LocaleEnum` in `src/constant.ts`.

Only for an explicitly requested repository-wide missing-translation repair, use `pnpm translation:prepare --all-missing`. This mode repairs missing/invalid translations and does not detect stale meanings in otherwise valid translations; use scoped keys and a baseline for English copy changes.

The result reports `batchDir`, `changedKeys` and per-locale `targets`. Each run creates a unique directory under `packages/i18n/.tmp.translation-batches/`, ignored by Git. Main locale JSON files and existing `locales/extend/` or batch files remain untouched during preparation. If `batchDir` is null, no work is required for the selected keys under the supplied baseline.

## 2. Translate the batch

Read the manifest and [TRANSLATION_PROMPT.md](TRANSLATION_PROMPT.md). The manifest's `languages` map names each locale and is authoritative for language names. Use `source/<locale>.json` as the exact source for that language; languages can require different keys. Write only `translations/<locale>.json` for nonempty target sets, with exactly that locale's keys. Do not produce an English translation file or empty-language files.

Retain the returned batch path throughout the run. When resuming, inspect and validate existing files before changing them; preserve valid work and correct only incomplete/invalid content. Never overwrite another batch or delete legacy extend files. Do not merge multiple batches concurrently.

Default protected symbols are BTC, ETH, USDC and USDT. Inspect the source for additional symbols/codes and include them at preparation with `--symbols SOL,ORDER` as needed. Preserve trading meaning, placeholders, markup and formatting. Translate Traditional Chinese independently; valid short strings may coincide with Simplified Chinese.

## 3. Validate before merging

```bash
pnpm translation:validate --batch /absolute/path/to/batch
```

Validation rebuilds current English and checks all targeted languages and keys, duplicate JSON keys, nonempty string values, placeholder names/counts, paired and preserved tags, newlines and protected symbols. It rejects English changes or edits to targeted locale entries since preparation. On a conflict, preserve the batch, inspect the changes and prepare a new batch for remaining task keys; never force a stale merge.

Review meaning and terminology for changed messages: mechanical checks cannot prove linguistic quality. An English value changing without placeholder changes still requires a fresh translation in every language.

## 4. Merge and report

```bash
pnpm translation:merge --batch /absolute/path/to/batch
pnpm copyLocales
```

Merge repeats full preflight, saves original files in a unique `.merge-*` recovery directory inside the batch, patches only targeted locale entries and scoped English entries, preserves other entries, then reads back every modified file. Write/verification failures trigger rollback; if rollback fails, report affected paths and the recovery directory immediately. Artifacts remain available on failure and success; `merged.json` marks a verified merge and prevents replay. Never delete a batch as an implicit completion step.

Review the final Git diff for task-only changes and preserved placeholders. Report synchronized keys/locales, valid translations retained and pending/failed work. Do not claim completion merely because files were generated. If blocked, include the reason and affected keys/locales. Editing this skill alone does not trigger translation.

## Workflow checks

After changing the helper, run `pnpm test:translation`. Fixtures use temporary directories and never modify repository locale files. Every `translation:*` command rebuilds `dist` and restores `dist/locales` via `copyLocales` automatically, so locale assets stay complete even when a command fails; the explicit `pnpm copyLocales` after `translation:merge` (step 4) then syncs the merged files into `dist`.
