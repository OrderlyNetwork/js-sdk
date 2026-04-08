/**
 * Offline smoke checks for retrieval paths (tech §8.5 minimal set).
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { AI_DOCS_ROOT, GENERATED_ROOT, REPO_ROOT } from "./internal/paths.js";

function main() {
  const symPath = path.join(GENERATED_ROOT, "indexes/symbol-index.json");
  if (!fs.existsSync(symPath)) {
    console.error("eval: run generate first");
    process.exit(1);
  }
  JSON.parse(fs.readFileSync(symPath, "utf8")) as Record<string, { entityId: string }>;

  const wf = path.join(AI_DOCS_ROOT, "workflows", "wallet-connect.md");
  if (!fs.existsSync(wf)) {
    console.error("eval: missing workflows/wallet-connect.md");
    process.exit(1);
  }

  const docIdx = path.join(GENERATED_ROOT, "indexes", "component-doc-index.json");
  if (!fs.existsSync(docIdx)) {
    console.error("eval: missing indexes/component-doc-index.json — run generate");
    process.exit(1);
  }
  const idx = JSON.parse(fs.readFileSync(docIdx, "utf8")) as Record<string, { mdPath?: string }>;
  if (Object.keys(idx).length < 1) {
    console.error("eval: expected non-empty component-doc-index");
    process.exit(1);
  }

  console.warn("eval: OK", { repo: REPO_ROOT });
}

main();
