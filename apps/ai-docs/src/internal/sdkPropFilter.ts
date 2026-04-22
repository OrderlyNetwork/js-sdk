import path from "node:path";
import type { ComponentDoc, Props } from "react-docgen-typescript";

const NODE_MODULES = `${path.sep}node_modules${path.sep}`;

/**
 * react-docgen often emits declaration paths relative to the TS project root (not absolute).
 */
function normalizeDeclarationPath(fileName: string, repoRoot: string): string {
  if (path.isAbsolute(fileName)) {
    return path.normalize(fileName);
  }
  const norm = fileName.replace(/\\/g, "/");
  const idx = norm.indexOf("/packages/");
  if (idx >= 0) {
    return path.normalize(path.join(repoRoot, norm.slice(idx + 1)));
  }
  return path.normalize(path.resolve(repoRoot, fileName));
}

/**
 * True if path is from React's published type roots (DOM / synthetic props on components).
 */
function isReactTypesDeclaration(fileName: string): boolean {
  const n = fileName.replace(/\\/g, "/");
  return (
    /\/@types\/react\//.test(n) ||
    /\/node_modules\/react\//.test(n) ||
    /\.pnpm\/[^/]*@types\+react[^/]*\/node_modules\/@types\/react\//.test(n)
  );
}

/**
 * After full extraction, drop inherited HTML/React props; keep:
 * - props whose parent is under monorepo `packages/`
 * - props from `tailwind-variants` (VariantProps)
 * - props with no `parent` when the component lives under `packages/` (e.g. tv/VariantProps)
 */
export function filterSdkDeclaredProps(doc: ComponentDoc, repoRoot: string): Props {
  const resolvedRoot = path.resolve(repoRoot);
  const packagesPrefix = path.join(resolvedRoot, "packages") + path.sep;
  const compAbs = path.resolve(doc.filePath);

  const out: Props = {};

  for (const [propName, prop] of Object.entries(doc.props ?? {})) {
    if (propName === "key" || propName === "children") continue;

    const parentFn = prop.parent?.fileName;
    if (parentFn) {
      const abs = normalizeDeclarationPath(parentFn, resolvedRoot);
      if (isReactTypesDeclaration(abs)) continue;
      if (abs.includes(NODE_MODULES)) {
        if (abs.includes(`${path.sep}tailwind-variants${path.sep}`)) {
          out[propName] = prop;
        }
        continue;
      }
      if (abs.startsWith(packagesPrefix)) {
        out[propName] = prop;
      }
      continue;
    }

    /* VariantProps / similar: no parent on PropItem — only trust inside our packages */
    if (compAbs.startsWith(packagesPrefix)) {
      out[propName] = prop;
    }
  }

  return out;
}
