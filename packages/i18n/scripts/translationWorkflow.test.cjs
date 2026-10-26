const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const {
  prepareBatch,
  validateBatch,
  mergeBatch,
  validateTranslation,
  parseTranslations,
} = require("./translationWorkflow");

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "i18n-workflow-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const localesDir = path.join(root, "locales");
  await fs.mkdir(localesDir);
  const baseline = {
    changed: "Old {{value}} USDC",
    stable: "Stable",
    unrelated: "Unrelated",
  };
  const source = {
    ...baseline,
    changed: "New {{value}} USDC",
    added: "Buy BTC",
    otherNew: "Sell ETH",
  };
  const dictionaries = {
    en: { ...source },
    zh: {
      changed: "旧 {{value}} USDC",
      stable: "稳定",
      unrelated: "无关",
      added: "买入 BTC",
    },
    tc: { changed: "舊 {{value}} USDC", stable: "穩定", unrelated: "無關" },
  };
  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    await fs.writeFile(
      path.join(localesDir, `${locale}.json`),
      JSON.stringify(dictionary),
    );
  }
  const options = {
    localesDir,
    batchesDir: path.join(root, "batches"),
    source,
    baseline,
    locales: ["zh", "tc"],
    languages: {
      en: "English",
      zh: "Simplified Chinese",
      tc: "Traditional Chinese",
    },
    keys: ["changed", "added", "stable"],
  };
  const read = async (locale) =>
    JSON.parse(
      await fs.readFile(path.join(localesDir, `${locale}.json`), "utf8"),
    );
  const prepare = async () => {
    const { batchDir } = await prepareBatch(options);
    return { batchDir, ...options };
  };
  const translate = async (batch) => {
    const manifest = JSON.parse(
      await fs.readFile(path.join(batch.batchDir, "manifest.json"), "utf8"),
    );
    for (const locale of options.locales) {
      const translations = Object.fromEntries(
        manifest.targets[locale].map((key) => [
          key,
          `translated ${locale}: ${source[key]}`,
        ]),
      );
      if (Object.keys(translations).length) {
        await fs.writeFile(
          path.join(batch.batchDir, `translations/${locale}.json`),
          JSON.stringify(translations),
        );
      }
    }
  };
  return { root, options, prepare, translate, read, dictionaries };
}

test("changed English is retranslated even when en.json was already regenerated; valid existing translations stay untouched", async (t) => {
  const f = await fixture(t);
  const batch = await f.prepare();
  const { manifest } = await (async () => {
    await f.translate(batch);
    return validateBatch(batch);
  })();
  assert.deepEqual(manifest.changedKeys, ["changed"]);
  assert.deepEqual(manifest.targets, {
    zh: ["changed"],
    tc: ["added", "changed"],
  });
  assert.deepEqual(manifest.languages, {
    en: "English",
    zh: "Simplified Chinese",
    tc: "Traditional Chinese",
  });
  assert.equal(manifest.english.otherNew, undefined);
  const result = await mergeBatch(batch);
  assert.equal((await f.read("zh")).added, "买入 BTC");
  assert.equal((await f.read("zh")).stable, "稳定");
  assert.equal((await f.read("tc")).stable, "穩定");
  assert.equal((await f.read("zh")).unrelated, "无关");
  assert.equal((await f.read("zh")).otherNew, undefined);
  assert.equal((await f.read("tc")).added, "translated tc: Buy BTC");
  assert.deepEqual(result.targets, manifest.targets);
  await assert.rejects(mergeBatch(batch), /already been merged/);
});

test("missing scope fails; explicit all-missing repairs only invalid translations", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    prepareBatch({ ...f.options, keys: undefined }),
    /Specify task keys/,
  );
  await assert.rejects(
    prepareBatch({ ...f.options, keys: ["typo"] }),
    /Unknown English key/,
  );
  await assert.rejects(
    prepareBatch({ ...f.options, allMissing: true }),
    /mutually exclusive/,
  );
  await assert.rejects(
    prepareBatch({ ...f.options, languages: undefined }),
    /Language names are required/,
  );
  await assert.rejects(
    prepareBatch({
      ...f.options,
      locales: [...f.options.locales, "xx"],
    }),
    /Missing language name for locale: xx/,
  );
  await assert.rejects(
    prepareBatch({
      ...f.options,
      source: { ...f.options.source, badTag: "<b>Broken {{value}}" },
      keys: ["badTag"],
    }),
    /en:badTag: Unclosed tag/,
  );
  const { batchDir } = await prepareBatch({
    ...f.options,
    keys: undefined,
    allMissing: true,
  });
  const manifest = JSON.parse(
    await fs.readFile(path.join(batchDir, "manifest.json"), "utf8"),
  );
  assert.deepEqual(manifest.changedKeys, []);
  assert.deepEqual(manifest.targets.zh, ["otherNew"]);
  assert.deepEqual(manifest.targets.tc, ["added", "otherNew"]);
});

test("a completed scope returns no work and creates no batch", async (t) => {
  const f = await fixture(t);
  const result = await prepareBatch({ ...f.options, keys: ["stable"] });
  assert.equal(result.batchDir, null);
  await assert.rejects(fs.stat(f.options.batchesDir), { code: "ENOENT" });
});

test("existing batches and legacy extend contents are never overwritten or removed", async (t) => {
  const f = await fixture(t);
  const extend = path.join(f.options.localesDir, "extend");
  await fs.mkdir(extend);
  await fs.writeFile(path.join(extend, "zh.json"), '{"otherTask":"已有翻译"}');
  const first = await f.prepare();
  await f.translate(first);
  const original = await fs.readFile(
    path.join(first.batchDir, "translations/zh.json"),
    "utf8",
  );
  const second = await f.prepare();
  assert.notEqual(first.batchDir, second.batchDir);
  assert.equal(
    await fs.readFile(
      path.join(first.batchDir, "translations/zh.json"),
      "utf8",
    ),
    original,
  );
  await mergeBatch(first);
  assert.equal(
    await fs.readFile(path.join(extend, "zh.json"), "utf8"),
    '{"otherTask":"已有翻译"}',
  );
  assert.ok(await fs.stat(second.batchDir));
  assert.ok(await fs.stat(path.join(first.batchDir, "translations/zh.json")));
});

test("preflight rejects missing languages and wrong keys without changing any locale", async (t) => {
  const f = await fixture(t);
  const batch = await f.prepare();
  await assert.rejects(mergeBatch(batch), /Translation files must match/);
  await f.translate(batch);
  await fs.writeFile(
    path.join(batch.batchDir, "translations/tc.json"),
    '{"wrong":"翻譯"}',
  );
  await assert.rejects(mergeBatch(batch), /keys do not match/);
  for (const locale of ["en", "zh", "tc"])
    assert.deepEqual(await f.read(locale), f.dictionaries[locale]);
  assert.ok(await fs.stat(batch.batchDir));
});

test("a placeholder mismatch in the last locale aborts the entire merge before any writes", async (t) => {
  const f = await fixture(t);
  const batch = await f.prepare();
  await f.translate(batch);
  const file = path.join(batch.batchDir, "translations/tc.json");
  const translations = JSON.parse(await fs.readFile(file, "utf8"));
  translations.changed = "遗漏占位符 USDC";
  await fs.writeFile(file, JSON.stringify(translations));
  await assert.rejects(
    mergeBatch(batch),
    /tc:changed: Mismatched placeholders/,
  );
  for (const locale of ["en", "zh", "tc"])
    assert.deepEqual(await f.read(locale), f.dictionaries[locale]);
  assert.ok(await fs.stat(file));
});

test("source changes and concurrent edits to targeted translations block a stale merge", async (t) => {
  const f = await fixture(t);
  const batch = await f.prepare();
  await f.translate(batch);
  await assert.rejects(
    mergeBatch({ ...batch, source: { ...batch.source, changed: "Different" } }),
    /English source changed/,
  );
  const changed = {
    ...(await f.read("zh")),
    changed: "人工翻译 {{value}} USDC",
  };
  await fs.writeFile(
    path.join(batch.localesDir, "zh.json"),
    JSON.stringify(changed),
  );
  await assert.rejects(mergeBatch(batch), /Locale changed during translation/);
  assert.deepEqual(await f.read("zh"), changed);
});

test("unrelated concurrent locale edits survive the scoped merge", async (t) => {
  const f = await fixture(t);
  const batch = await f.prepare();
  await f.translate(batch);
  await fs.writeFile(
    path.join(batch.localesDir, "zh.json"),
    JSON.stringify({ ...(await f.read("zh")), unrelated: "人工调整" }),
  );
  await mergeBatch(batch);
  assert.equal((await f.read("zh")).unrelated, "人工调整");
});

test("write failure rolls back every attempted file and retains translation artifacts", async (t) => {
  const f = await fixture(t);
  const batch = await f.prepare();
  await f.translate(batch);
  const writeFile = fs.writeFile;
  let fail = true;
  t.mock.method(fs, "writeFile", async (file, ...args) => {
    if (file === path.join(batch.localesDir, "tc.json") && fail) {
      fail = false;
      await writeFile(file, "partial");
      throw new Error("disk failure");
    }
    return writeFile(file, ...args);
  });
  await assert.rejects(mergeBatch(batch), /disk failure/);
  t.mock.restoreAll();
  for (const locale of ["en", "zh", "tc"])
    assert.deepEqual(await f.read(locale), f.dictionaries[locale]);
  assert.ok(await fs.stat(path.join(batch.batchDir, "translations/tc.json")));
  await assert.rejects(fs.stat(path.join(batch.batchDir, "merged.json")), {
    code: "ENOENT",
  });
});

test("a failed rollback reports affected paths and keeps complete original files for recovery", async (t) => {
  const f = await fixture(t);
  const batch = await f.prepare();
  await f.translate(batch);
  const writeFile = fs.writeFile;
  const zhFile = path.join(batch.localesDir, "zh.json");
  const tcFile = path.join(batch.localesDir, "tc.json");
  let fail = true;
  t.mock.method(fs, "writeFile", async (file, content, ...args) => {
    if (file === tcFile && fail) {
      fail = false;
      throw new Error("disk failure");
    }
    if (file === zhFile && content === JSON.stringify(f.dictionaries.zh))
      throw new Error("rollback failure");
    return writeFile(file, content, ...args);
  });
  await assert.rejects(mergeBatch(batch), (error) => {
    assert.ok(error instanceof AggregateError);
    assert.ok(error.message.includes(zhFile));
    assert.ok(error.message.includes("Original files retained"));
    return true;
  });
  t.mock.restoreAll();
  const attempt = (await fs.readdir(batch.batchDir)).find((file) =>
    file.startsWith(".merge-"),
  );
  assert.equal(
    await fs.readFile(path.join(batch.batchDir, attempt, "zh.json"), "utf8"),
    JSON.stringify(f.dictionaries.zh),
  );
  await assert.rejects(fs.stat(path.join(batch.batchDir, "merged.json")), {
    code: "ENOENT",
  });
});

test("validation rejects dropped, renamed and repeated placeholders, broken or stray tags, newlines and token changes; void elements pass", () => {
  for (const [source, translated] of [
    ["Min {{quantity}} ({{total}} USDC)", "最低 {{quantity}} USDC"],
    ["{{value}}", "{{other}}"],
    ["{{value}} {{value}}", "{{value}}"],
    ["<b>{{value}}</b>", "<i>{{value}}</i>"],
    ["<b>Value</b>", "<b>值"],
    ["First\nSecond", "第一第二"],
    ["Buy BTC", "购买比特币"],
    ["{{value}} USDC", "{{value}} USDT"],
    ["Line1<br>Line2", "第一行第二行"],
    ["ok", "a</br>b"],
  ])
    assert.throws(() => validateTranslation(source, translated));
  validateTranslation(
    "<b>{{value}}</b>\nBTC USDC",
    "BTC USDC\n<b>{{value}}</b>",
  );
  validateTranslation("Line1<br>Line2 {{value}}", "{{value}}<br>第一行第二行");
  validateTranslation(
    "{{amount, number}} {{- link}}",
    "{{- link}}：{{amount, number}}",
  );
  assert.throws(
    () => validateTranslation("{{amount, number}}", "{{amount, currency}}"),
    /placeholders/,
  );
  assert.throws(
    () => validateTranslation("SOL", "索拉纳", ["SOL"]),
    /protected symbol/,
  );
});

test("translation files reject malformed JSON, duplicate keys and non-string values", () => {
  assert.throws(() => parseTranslations('{"x":"a","x":"b"}'), /Duplicate/);
  for (const input of ['{"x":3}', '{"x":"a",}', "{}{}", "[]"])
    assert.throws(() => parseTranslations(input));
  assert.deepEqual(parseTranslations('{"x":"quoted \\"word\\": value"}'), {
    x: 'quoted "word": value',
  });
});
