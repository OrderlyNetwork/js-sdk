/**
 * Build QMD SQLite index via @tobilu/qmd (programmatic). Run after `generate`.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createStore } from "@tobilu/qmd";
import { AI_DOCS_ROOT, GENERATED_ROOT, PACKAGES_ROOT, REPO_ROOT } from "./internal/paths.js";

/** QMD collection for workflows, recipes, and agent docs under `apps/ai-docs`. */
const COLLECTION_AI_DOCS = "orderly-ai-docs";
/** QMD collection for markdown spread across workspace packages (README, doc/, CHANGELOG, etc.). */
const COLLECTION_PACKAGES = "orderly-packages";

async function main() {
  const manifestPath = path.join(GENERATED_ROOT, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("Run `pnpm --filter @orderly.network/ai-docs generate` first.");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    qmd?: { indexPath?: string };
  };
  const indexRel = manifest.qmd?.indexPath ?? "qmd/index.sqlite";
  const dbPath = path.join(GENERATED_ROOT, indexRel);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const store = await createStore({
    dbPath,
    config: {
      collections: {
        [COLLECTION_AI_DOCS]: {
          path: AI_DOCS_ROOT,
          pattern: "**/*.md",
          ignore: [
            "generated/json/**",
            "generated/indexes/**",
            "generated/qmd/**",
            "node_modules/**",
          ],
        },
        [COLLECTION_PACKAGES]: {
          path: PACKAGES_ROOT,
          pattern: "**/*.md",
          ignore: [
            "**/node_modules/**",
            "**/dist/**",
            "**/coverage/**",
            "**/.turbo/**",
          ],
        },
      },
    },
  });

  try {
    const res = await store.update();
    process.stderr.write(
      `[ai-docs] qmd update: indexed=${res.indexed} updated=${res.updated} unchanged=${res.unchanged}\n`,
    );
  } catch (e) {
    console.error("[ai-docs] QMD index failed:", e);
    console.error(
      "If better-sqlite3 failed to load, run `pnpm approve-builds` in the repo root and reinstall.",
    );
    process.exit(1);
  } finally {
    await store.close();
  }

  const man = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    qmd?: { lastIndexBuildAt?: string | null };
  };
  man.qmd = man.qmd ?? {};
  man.qmd.lastIndexBuildAt = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(man, null, 2) + "\n", "utf8");
  console.warn("qmd:index: completed (manifest updated)", { dbPath: path.relative(REPO_ROOT, dbPath) });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
