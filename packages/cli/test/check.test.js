const assert = require("node:assert/strict");
const { test } = require("node:test");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const checkCommand = require("../src/commands/check");

function makePlugin(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "devkit-check-"));
  fs.mkdirSync(path.join(dir, "dist"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "@scope/demo", files: ["dist"] }),
  );
  if (content !== undefined) {
    fs.writeFileSync(path.join(dir, "dist", "index.js"), content);
  }
  return dir;
}

/**
 * Run the handler with console captured and a known starting exit code,
 * returning what it printed and the exit code it left behind.
 */
async function runCheck(argv, initialExitCode = 0) {
  const savedExitCode = process.exitCode;
  const savedLog = console.log;
  const savedError = console.error;
  const messages = [];

  console.log = (...args) => messages.push(args.join(" "));
  console.error = (...args) => messages.push(args.join(" "));
  process.exitCode = initialExitCode;

  let exitCode;
  try {
    await checkCommand.handler(argv);
    exitCode = process.exitCode;
  } finally {
    console.log = savedLog;
    console.error = savedError;
    process.exitCode = savedExitCode;
  }
  return { output: messages.join("\n"), exitCode };
}

test("check is advisory by default — warns but does not fail", async () => {
  const dir = makePlugin('import { a } from "@solana/web3.js";');
  const { output, exitCode } = await runCheck({ path: dir, strict: false });
  assert.equal(exitCode, 0);
  assert.match(output, /cannot be installed as a runtime plugin/);
  assert.match(output, /@solana\/web3\.js/);
  assert.match(output, /Advisory only/);
});

test("check --strict exits non-zero", async () => {
  const dir = makePlugin('import { a } from "@solana/web3.js";');
  const { exitCode } = await runCheck({ path: dir, strict: true });
  assert.equal(exitCode, 1);
});

test("check passes a self-contained bundle even with --strict", async () => {
  const dir = makePlugin(
    [
      'import { a } from "react";',
      'import { b } from "@orderly.network/ui";',
    ].join("\n"),
  );
  const { output, exitCode } = await runCheck({ path: dir, strict: true });
  assert.equal(exitCode, 0);
  assert.match(output, /OK —/);
});

test("check warns when there is no published build", async () => {
  const dir = makePlugin(undefined);
  const { output, exitCode } = await runCheck({ path: dir, strict: true });
  assert.equal(exitCode, 0);
  assert.match(output, /No published JavaScript found/);
});
