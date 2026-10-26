const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { parseArgs } = require("node:util");
const { validateI18nValue } = require("./utils");

const DEFAULT_SYMBOLS = ["BTC", "ETH", "USDC", "USDT"];
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = (values) => [...values].sort();
const snapshot = (object, keys) =>
  Object.fromEntries(
    keys.map((key) => [key, own(object, key) ? [object[key]] : []]),
  );
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const writeJson = (file, value) =>
  fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });

/** Parse a flat translation dictionary, rejecting duplicate keys before merge. */
function parseTranslations(text) {
  const value = JSON.parse(text);
  if (!value || Array.isArray(value) || typeof value !== "object")
    throw new Error("Translations must be a JSON object");
  let index = 0;
  const skipSpace = () => {
    while (/\s/.test(text[index] ?? "") && index < text.length) index++;
  };
  const string = () => {
    skipSpace();
    if (text[index] !== '"')
      throw new Error("Translation values must be strings");
    const start = index++;
    while (index < text.length) {
      if (text[index] === "\\") index += 2;
      else if (text[index++] === '"')
        return JSON.parse(text.slice(start, index));
    }
    throw new Error("Unterminated JSON string");
  };
  skipSpace();
  index++;
  const seen = new Set();
  skipSpace();
  while (text[index] !== "}") {
    const key = string();
    if (seen.has(key)) throw new Error(`Duplicate translation key: ${key}`);
    seen.add(key);
    skipSpace();
    index++;
    string();
    skipSpace();
    if (text[index] === ",") index++;
    skipSpace();
  }
  return value;
}

const tokens = (text, pattern) => sorted(text.match(pattern) ?? []);

/** Compare interpolation and formatting tokens with the English source. */
function validateTranslation(source, translated, symbols = DEFAULT_SYMBOLS) {
  // Normalize valid i18next formatting fragments for the shared syntax checker.
  const syntaxValue =
    typeof translated === "string"
      ? translated.replace(/{{-?\s*[\w.-]+(?:\s*,[^{}]+)?\s*}}/g, "{{value}}")
      : translated;
  const validity = validateI18nValue(syntaxValue);
  if (!validity.valid) throw new Error(validity.error);
  for (const [name, pattern] of [
    ["placeholders", /{{[\s\S]*?}}/g],
    ["tags", /<\/?[a-zA-Z0-9][^>]*>/g],
    ["newlines", /\n|\\n/g],
  ]) {
    if (!same(tokens(source, pattern), tokens(translated, pattern)))
      throw new Error(`Mismatched ${name}`);
  }
  for (const symbol of symbols) {
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`,
      "g",
    );
    if (!same(tokens(source, pattern), tokens(translated, pattern)))
      throw new Error(`Mismatched protected symbol: ${symbol}`);
  }
}

function validTranslation(source, translated, symbols) {
  try {
    validateTranslation(source, translated, symbols);
    return true;
  } catch {
    return false;
  }
}

/** Resolve locale codes to language names, failing loudly on unknown locales. */
function resolveLanguages(languages, locales) {
  if (!languages || typeof languages !== "object")
    throw new Error("Language names are required for prepare");
  return Object.fromEntries(
    ["en", ...locales].map((locale) => {
      if (!own(languages, locale))
        throw new Error(`Missing language name for locale: ${locale}`);
      return [locale, languages[locale]];
    }),
  );
}

/** Prepare an isolated batch; existing locale and extend files are read-only. */
async function prepareBatch({
  localesDir,
  batchesDir,
  source,
  baseline,
  locales,
  languages,
  keys,
  allMissing = false,
  symbols = DEFAULT_SYMBOLS,
}) {
  if (!allMissing && (!Array.isArray(keys) || keys.length === 0))
    throw new Error(
      "Specify task keys with --keys, or explicitly select --all-missing",
    );
  if (allMissing && keys?.length)
    throw new Error("--keys and --all-missing are mutually exclusive");
  const batchLanguages = resolveLanguages(languages, locales);
  const selected = sorted(new Set(allMissing ? Object.keys(source) : keys));
  for (const key of selected) {
    if (!own(source, key)) throw new Error(`Unknown English key: ${key}`);
    try {
      validateTranslation(source[key], source[key], symbols);
    } catch (error) {
      throw new Error(`en:${key}: ${error.message}`);
    }
  }
  const dictionaries = {};
  for (const locale of ["en", ...locales]) {
    dictionaries[locale] = await readJson(
      path.join(localesDir, `${locale}.json`),
    );
  }
  const changedKeys = allMissing
    ? []
    : selected.filter(
        (key) => own(baseline, key) && baseline[key] !== source[key],
      );
  const targets = Object.fromEntries(
    locales.map((locale) => [
      locale,
      selected.filter(
        (key) =>
          changedKeys.includes(key) ||
          !validTranslation(source[key], dictionaries[locale][key], symbols),
      ),
    ]),
  );
  const englishKeys = selected.filter(
    (key) =>
      dictionaries.en[key] !== source[key] ||
      locales.some((locale) => targets[locale].includes(key)),
  );
  if (englishKeys.length === 0) return { batchDir: null, targets, changedKeys };
  const manifest = {
    version: 1,
    english: Object.fromEntries(englishKeys.map((key) => [key, source[key]])),
    changedKeys,
    locales,
    languages: batchLanguages,
    symbols,
    targets,
    previous: Object.fromEntries(
      ["en", ...locales].map((locale) => [
        locale,
        snapshot(
          dictionaries[locale],
          locale === "en" ? englishKeys : targets[locale],
        ),
      ]),
    ),
  };
  await fs.mkdir(batchesDir, { recursive: true });
  const batchDir = path.join(batchesDir, randomUUID());
  await fs.mkdir(batchDir);
  await fs.mkdir(path.join(batchDir, "source"));
  await fs.mkdir(path.join(batchDir, "translations"));
  await writeJson(path.join(batchDir, "source/en.json"), manifest.english);
  for (const locale of locales) {
    await writeJson(
      path.join(batchDir, `source/${locale}.json`),
      Object.fromEntries(targets[locale].map((key) => [key, source[key]])),
    );
  }
  await writeJson(path.join(batchDir, "manifest.json"), manifest);
  return { batchDir, targets, changedKeys };
}

/** Validate the entire batch and detect concurrent source/translation edits. */
async function validateBatch({ batchDir, localesDir, source, locales }) {
  const manifest = await readJson(path.join(batchDir, "manifest.json"));
  if (manifest.version !== 1 || !same(manifest.locales, locales))
    throw new Error(
      "Batch version or configured locale list changed; prepare a new batch",
    );
  if (await fs.stat(path.join(batchDir, "merged.json")).catch(() => false))
    throw new Error("Batch has already been merged");
  if (
    !same(
      await readJson(path.join(batchDir, "source/en.json")),
      manifest.english,
    )
  )
    throw new Error("Batch English source was modified");
  for (const [key, value] of Object.entries(manifest.english)) {
    if (source[key] !== value)
      throw new Error(`English source changed during translation: ${key}`);
  }
  const expectedFiles = locales
    .filter((locale) => manifest.targets[locale].length > 0)
    .map((locale) => `${locale}.json`);
  const actualFiles = await fs.readdir(path.join(batchDir, "translations"));
  if (!same(sorted(expectedFiles), sorted(actualFiles)))
    throw new Error(
      `Translation files must match targets exactly: ${expectedFiles.join(", ")}`,
    );
  const outputs = {};
  for (const locale of ["en", ...locales]) {
    const keys =
      locale === "en"
        ? Object.keys(manifest.english)
        : manifest.targets[locale];
    const file = path.join(localesDir, `${locale}.json`);
    const original = await fs.readFile(file, "utf8");
    const current = JSON.parse(original);
    if (!same(snapshot(current, keys), manifest.previous[locale]))
      throw new Error(
        `Locale changed during translation: ${locale}; prepare a new batch`,
      );
    let translated = manifest.english;
    if (locale !== "en") {
      const expected = Object.fromEntries(
        keys.map((key) => [key, manifest.english[key]]),
      );
      if (
        !same(
          await readJson(path.join(batchDir, `source/${locale}.json`)),
          expected,
        )
      )
        throw new Error(`Batch source was modified: ${locale}`);
      translated = keys.length
        ? parseTranslations(
            await fs.readFile(
              path.join(batchDir, `translations/${locale}.json`),
              "utf8",
            ),
          )
        : {};
    }
    if (!same(sorted(keys), sorted(Object.keys(translated))))
      throw new Error(`Translation keys do not match targets: ${locale}`);
    for (const key of keys) {
      try {
        validateTranslation(
          manifest.english[key],
          translated[key],
          manifest.symbols,
        );
      } catch (error) {
        throw new Error(`${locale}:${key}: ${error.message}`);
      }
    }
    if (keys.length) {
      outputs[file] = {
        original,
        merged: `${JSON.stringify({ ...current, ...translated }, null, 2)}\n`,
      };
    }
  }
  return { manifest, outputs };
}

/** Preflight all locales before writing; retain the batch and restore on failure. */
async function mergeBatch(options) {
  const { manifest, outputs } = await validateBatch(options);
  const recoveryDir = path.join(options.batchDir, `.merge-${randomUUID()}`);
  await fs.mkdir(recoveryDir);
  for (const [file, { original }] of Object.entries(outputs)) {
    await fs.writeFile(path.join(recoveryDir, path.basename(file)), original, {
      flag: "wx",
    });
  }
  const written = [];
  try {
    for (const [file, { original, merged }] of Object.entries(outputs)) {
      if ((await fs.readFile(file, "utf8")) !== original)
        throw new Error(`Locale changed before write: ${file}`);
      // Include the attempted file in rollback even if the write only partially succeeds.
      written.push(file);
      await fs.writeFile(file, merged);
    }
    for (const [file, { merged }] of Object.entries(outputs)) {
      if ((await fs.readFile(file, "utf8")) !== merged)
        throw new Error(`Merged locale verification failed: ${file}`);
    }
    const receipt = path.join(options.batchDir, `.merged-${randomUUID()}.json`);
    await writeJson(receipt, {
      englishKeys: Object.keys(manifest.english),
      targets: manifest.targets,
      recoveryDir,
    });
    await fs.rename(receipt, path.join(options.batchDir, "merged.json"));
  } catch (error) {
    const restored = await Promise.allSettled(
      written.map((file) => fs.writeFile(file, outputs[file].original)),
    );
    const failures = restored.filter((result) => result.status === "rejected");
    if (failures.length) {
      const failedPaths = written.filter(
        (_, index) => restored[index].status === "rejected",
      );
      throw new AggregateError(
        [error, ...failures.map((result) => result.reason)],
        `Merge failed; unable to restore ${failedPaths.join(", ")}. Original files retained at ${recoveryDir}`,
      );
    }
    throw new Error(
      `${error.message}. Original files retained at ${recoveryDir}`,
      { cause: error },
    );
  }
  return {
    englishKeys: Object.keys(manifest.english),
    targets: manifest.targets,
    recoveryDir,
  };
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      keys: { type: "string" },
      baseline: { type: "string" },
      batch: { type: "string" },
      symbols: { type: "string" },
      "all-missing": { type: "boolean", default: false },
    },
  });
  const [command] = positionals;
  if (
    positionals.length !== 1 ||
    !["prepare", "validate", "merge"].includes(command)
  )
    throw new Error(
      "Usage: translationWorkflow.js prepare --keys key1,key2 | validate --batch PATH | merge --batch PATH",
    );
  const packageDir = path.resolve(__dirname, "..");
  const { en: source, LocaleEnum, defaultLanguages } = require("../dist");
  const locales = Object.values(LocaleEnum).filter((locale) => locale !== "en");
  const localesDir = path.join(packageDir, "locales");
  if (command === "prepare") {
    if (values.batch)
      throw new Error(
        "prepare creates a new isolated batch; do not pass --batch",
      );
    if (values.baseline && values["all-missing"])
      throw new Error("--baseline and --all-missing are mutually exclusive");
    const baseline = values.baseline
      ? await readJson(path.resolve(values.baseline))
      : values["all-missing"]
        ? {}
        : JSON.parse(
            execFileSync(
              "git",
              ["show", "HEAD:packages/i18n/locales/en.json"],
              { cwd: packageDir, encoding: "utf8" },
            ),
          );
    console.log(
      JSON.stringify(
        await prepareBatch({
          localesDir,
          batchesDir: path.join(packageDir, ".tmp.translation-batches"),
          source,
          baseline,
          locales,
          keys: values.keys
            ?.split(",")
            .map((key) => key.trim())
            .filter(Boolean),
          languages: Object.fromEntries(
            defaultLanguages.map(({ localCode, displayName }) => [
              localCode,
              displayName,
            ]),
          ),
          allMissing: values["all-missing"],
          symbols: [
            ...new Set([
              ...DEFAULT_SYMBOLS,
              ...(values.symbols?.split(",").filter(Boolean) ?? []),
            ]),
          ],
        }),
        null,
        2,
      ),
    );
  } else {
    if (!values.batch) throw new Error("Specify --batch PATH");
    if (
      values.keys ||
      values.baseline ||
      values.symbols ||
      values["all-missing"]
    )
      throw new Error(
        "validate/merge use the batch manifest; only --batch is accepted",
      );
    const options = {
      batchDir: path.resolve(values.batch),
      localesDir,
      source,
      locales,
    };
    if (command === "merge")
      console.log(JSON.stringify(await mergeBatch(options), null, 2));
    else {
      const { manifest } = await validateBatch(options);
      console.log(
        JSON.stringify({ valid: true, targets: manifest.targets }, null, 2),
      );
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  prepareBatch,
  validateBatch,
  mergeBatch,
  validateTranslation,
  parseTranslations,
};
