/**
 * Curated component markdown under apps/ai-docs/components/ (frontmatter `id:`) plus generated
 * stubs under generated/docs-md/components/. Writes component-doc-index for facade routing.
 */
import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";
import type { ComponentEntity } from "./entityTypes.js";
import { AI_DOCS_ROOT, GENERATED_ROOT, relFromRepo } from "./paths.js";

export type ComponentDocIndexEntry = {
  entityId: string;
  /**
   * - `generated`: path relative to `apps/ai-docs/generated/` (e.g. `docs-md/components/x.md`).
   * - `curated`: path relative to monorepo root (e.g. `apps/ai-docs/components/x.md`).
   */
  mdPath: string;
  package: string;
  name: string;
  source: "curated" | "generated";
};

export type ComponentDocIndex = Record<string, ComponentDocIndexEntry>;

function safeEntitySlug(entityId: string): string {
  return entityId.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

/** Parse `id:` from YAML frontmatter (simple line-oriented YAML scan). */
function parseFrontmatterId(raw: string): string | undefined {
  if (!raw.startsWith("---")) return undefined;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return undefined;
  const fm = raw.slice(3, end);
  const m = fm.match(/^id:\s*(.+)$/m);
  return m ? m[1]!.trim() : undefined;
}

/**
 * Discover curated component docs: `components/*.md` with `id: component.*` in frontmatter.
 */
async function discoverCuratedByEntityId(): Promise<Map<string, string>> {
  const files = await fg("components/*.md", {
    cwd: AI_DOCS_ROOT,
    onlyFiles: true,
    ignore: ["**/node_modules/**"],
  });
  const map = new Map<string, string>();
  for (const rel of files) {
    const abs = path.join(AI_DOCS_ROOT, rel);
    const raw = fs.readFileSync(abs, "utf8");
    const id = parseFrontmatterId(raw);
    if (id) {
      map.set(id, relFromRepo(abs));
    }
  }
  return map;
}

function propsTableMarkdown(entity: ComponentEntity): string {
  if (!entity.props.length) return "_No props extracted._\n";
  const normalizeCell = (value: unknown): string => {
    const trimmed = value == null ? "" : String(value).trim();
    if (!trimmed) return "—";
    return trimmed.replace(/\|/g, "\\|");
  };
  const rows = entity.props.map(
    (p) =>
      `| \`${p.name}\` | ${normalizeCell(p.type)} | ${p.required ? "yes" : "no"} | ${normalizeCell(p.defaultValue)} | ${normalizeCell(p.description)} |`,
  );
  return (
    [
      "| Prop | Type | Required | Default | Description |",
      "| --- | --- | --- | --- | --- |",
      ...rows,
    ].join("\n") + "\n"
  );
}

/** Builds a deterministic one-line description fallback when no jsDoc is present. */
function descriptionMarkdown(entity: ComponentEntity): string {
  const docs = entity.jsDoc?.trim();
  if (docs) return docs;
  return `${entity.displayName ?? entity.name} is exported from \`${entity.package}\` and sourced at \`${entity.sourcePath}\`.`;
}

/** Adds rule-based guidance that stays stable across generation runs. */
function usageNotesMarkdown(entity: ComponentEntity): string {
  const optionalCount = entity.props.filter((p) => !p.required).length;
  if (!entity.props.length) {
    return "- This component currently exposes no extracted SDK props.\n";
  }
  if (optionalCount === entity.props.length) {
    return "- All extracted props are optional; start from defaults and opt into behavior incrementally.\n";
  }
  return "- Provide all required props first, then layer optional behavior-oriented props as needed.\n";
}

/**
 * Caveats help LLM users recognize extraction limits instead of misreading blank docs as complete docs.
 */
function caveatsMarkdown(entity: ComponentEntity): string | null {
  const hasMissingDescriptions = entity.props.some(
    (p) => !p.description?.trim(),
  );
  const hasMissingDefaults = entity.props.some(
    (p) => !String(p.defaultValue ?? "").trim(),
  );
  if (!hasMissingDescriptions && !hasMissingDefaults) {
    return null;
  }
  const caveats: string[] = [];
  if (hasMissingDescriptions) {
    caveats.push(
      "- Some prop descriptions were not available from source comments.",
    );
  }
  if (hasMissingDefaults) {
    caveats.push(
      "- Some default values could not be inferred statically from source.",
    );
  }
  return caveats.join("\n") + "\n";
}

function renderGeneratedStub(entity: ComponentEntity): string {
  const pkgs = JSON.stringify([entity.package]);
  const caveats = caveatsMarkdown(entity);
  return `---
kind: component-doc
id: ${entity.id}
packages: ${pkgs}
---

# ${entity.displayName ?? entity.name}

**Package:** \`${entity.package}\`  
**Source:** \`${entity.sourcePath}\`

> Auto-generated stub from \`components.json\`. Add or override with a curated file under \`apps/ai-docs/components/\` using the same \`id:\` in frontmatter.

## Description

${descriptionMarkdown(entity)}

## Props

${propsTableMarkdown(entity)}

## Usage notes

${usageNotesMarkdown(entity)}

## Caveats

${caveats ?? "_No caveats detected from static extraction._\n"}
`;
}

/**
 * Writes `docs-md/components/*.md` and returns index payload + relative path for manifest.
 */
export async function buildComponentDocArtifacts(
  components: ComponentEntity[],
): Promise<{
  index: ComponentDocIndex;
  indexRelPath: string;
}> {
  const curated = await discoverCuratedByEntityId();
  const outDir = path.join(GENERATED_ROOT, "docs-md", "components");
  fs.mkdirSync(outDir, { recursive: true });

  const index: ComponentDocIndex = {};

  for (const entity of components) {
    const curatedAbsPath = curated.get(entity.id);
    if (curatedAbsPath) {
      index[entity.id] = {
        entityId: entity.id,
        mdPath: curatedAbsPath,
        package: entity.package,
        name: entity.name,
        source: "curated",
      };
      continue;
    }

    const slug = safeEntitySlug(entity.id);
    const genRel = path
      .join("docs-md", "components", `${slug}.md`)
      .replace(/\\/g, "/");
    const abs = path.join(GENERATED_ROOT, genRel);
    fs.writeFileSync(abs, renderGeneratedStub(entity), "utf8");
    index[entity.id] = {
      entityId: entity.id,
      mdPath: genRel,
      package: entity.package,
      name: entity.name,
      source: "generated",
    };
  }

  return { index, indexRelPath: "indexes/component-doc-index.json" };
}
