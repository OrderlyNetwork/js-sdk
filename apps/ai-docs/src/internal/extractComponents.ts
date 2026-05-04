import path from "node:path";
import { withCustomConfig } from "react-docgen-typescript";
import type { ComponentDoc } from "react-docgen-typescript";
import type { ComponentEntity } from "./entityTypes.js";
import { REPO_ROOT, relFromRepo } from "./paths.js";
import { filterSdkDeclaredProps } from "./sdkPropFilter.js";

export type ComponentSample = {
  name: string;
  root: string;
  tsconfig: string;
  files: string[];
};

function stableComponentId(pkgName: string, doc: ComponentDoc) {
  const rel = relFromRepo(doc.filePath);
  const safe = rel.replace(/[^\w.-]+/g, "_");
  return `component.${pkgName.replace(/[^\w.-]+/g, "_")}.${safe}.${doc.displayName}`;
}

function mapDoc(
  doc: ComponentDoc,
  pkgName: string,
  gitSha: string,
  generatedAt: string,
  repoRoot: string,
): ComponentEntity {
  const filtered = filterSdkDeclaredProps(doc, repoRoot);
  const props = Object.entries(filtered).map(([propName, p]) => ({
    name: propName,
    type: p.type?.name ?? "unknown",
    required: p.required ?? false,
    defaultValue: p.defaultValue ?? null,
    description: p.description,
  }));

  return {
    id: stableComponentId(pkgName, doc),
    name: doc.displayName,
    displayName: doc.displayName,
    artifactKind: "component",
    gitSha,
    generatedAt,
    sourcePath: relFromRepo(doc.filePath),
    package: pkgName,
    resolutionLevel: "full",
    props,
    jsDoc: doc.description,
  };
}

/**
 * Extract React component props via react-docgen-typescript, one TS program per package (batched files).
 * Props are filtered to SDK-declared surface (see `sdkPropFilter.ts`).
 */
export function extractComponentSamples(
  samples: ComponentSample[],
  gitSha: string,
  generatedAt: string,
  repoRoot: string = REPO_ROOT,
): ComponentEntity[] {
  const byKey = new Map<string, ComponentSample>();

  for (const s of samples) {
    const key = `${s.root}::${s.tsconfig}`;
    const cur = byKey.get(key);
    if (!cur) {
      byKey.set(key, { ...s, files: [...s.files] });
    } else {
      const set = new Set([...cur.files, ...s.files]);
      byKey.set(key, { ...cur, files: [...set].sort() });
    }
  }

  const out: ComponentEntity[] = [];

  for (const sample of byKey.values()) {
    const tsconfigPath = path.join(repoRoot, sample.root, sample.tsconfig);
    const absFiles = sample.files.map((f) => path.join(repoRoot, sample.root, f));

    try {
      const parser = withCustomConfig(tsconfigPath, {
        savePropValueAsString: true,
        shouldExtractLiteralValuesFromEnum: true,
        shouldRemoveUndefinedFromOptional: true,
        skipChildrenPropWithoutDoc: true,
      });

      const docs = parser.parse(absFiles);
      for (const doc of docs) {
        out.push(mapDoc(doc, sample.name, gitSha, generatedAt, repoRoot));
      }
    } catch {
      for (const rel of sample.files) {
        const abs = path.join(repoRoot, sample.root, rel);
        try {
          const parser = withCustomConfig(tsconfigPath, {
            savePropValueAsString: true,
            shouldExtractLiteralValuesFromEnum: true,
            shouldRemoveUndefinedFromOptional: true,
            skipChildrenPropWithoutDoc: true,
          });
          const docs = parser.parse(abs);
          for (const doc of docs) {
            out.push(mapDoc(doc, sample.name, gitSha, generatedAt, repoRoot));
          }
        } catch {
          const base = path.basename(rel, path.extname(rel));
          out.push({
            id: `component.${sample.name.replace(/[^\w.-]+/g, "_")}.${rel.replace(/[^\w.-]+/g, "_")}.${base}`,
            name: base,
            artifactKind: "component",
            gitSha,
            generatedAt,
            sourcePath: relFromRepo(abs),
            package: sample.name,
            resolutionLevel: "syntax-only",
            degradedReason: "UNSUPPORTED_TYPE",
            props: [],
          });
        }
      }
    }
  }

  return out;
}
