const path = require("node:path");
const fs = require("node:fs");
const fg = require("fast-glob");
const { isHostProvidedPeer } = require("./pluginConfigSchema");

/**
 * Warning-only pre-submit check for the Orderly One runtime-plugin contract.
 *
 * Orderly One loads marketplace plugins at runtime and resolves only
 * react / react-dom / @orderly.network/* from the host import map. A published
 * build that leaves any other package as a bare import cannot be installed as a
 * runtime plugin in an Orderly One DEX, but it still works in hosts that bundle
 * the plugin at build time — so this never fails a submission, it only warns.
 *
 * Mirrors the server-side contract in dex-creator
 * `api/src/lib/pluginBundle.ts` (scanBareImports + isSharedRuntimeSpecifier).
 * `isHostProvidedPeer` is the shared allowlist; keep both in sync.
 */

const JS_FILE_PATTERN = /\.(?:[cm]?js|mjs)$/i;

const DEFAULT_IGNORES = [
  "**/node_modules/**",
  "**/.git/**",
  "**/coverage/**",
  "**/*.map",
];

// Same patterns as the server scanner, so both report the same specifiers.
const BARE_IMPORT_PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
];

function isBareSpecifier(specifier) {
  if (!specifier) return false;
  if (specifier.startsWith(".") || specifier.startsWith("/")) return false;
  return !/^[a-z][a-z0-9+.-]*:/.test(specifier);
}

/**
 * Bare specifiers a JS file imports (relative and URL specifiers excluded).
 * @param {string} source
 * @returns {string[]}
 */
function scanBareImports(source) {
  const found = new Set();
  for (const pattern of BARE_IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      if (isBareSpecifier(match[1])) found.add(match[1]);
    }
  }
  return [...found];
}

function isDirectory(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Glob patterns for the JS files npm would publish. Honours the `files`
 * allow-list when present; otherwise npm publishes the whole tree, so scan the
 * whole tree.
 * @param {string} packageDir
 * @returns {string[]}
 */
function bundleGlobs(packageDir) {
  let manifest = {};
  try {
    manifest = JSON.parse(
      fs.readFileSync(path.join(packageDir, "package.json"), "utf-8"),
    );
  } catch {
    // Unreadable manifest: fall back to scanning the package tree.
  }
  const files =
    Array.isArray(manifest.files) && manifest.files.length > 0
      ? manifest.files
      : null;
  // Without a `files` allow-list npm publishes the whole tree (minus ignores).
  if (!files) return ["**/*.{js,mjs,cjs}"];

  const patterns = [];
  for (const raw of files) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const entry = raw.replace(/^\.\//, "").replace(/\/+$/, "");
    if (/[*?{[]/.test(entry)) {
      patterns.push(entry);
    } else if (JS_FILE_PATTERN.test(entry)) {
      patterns.push(entry);
    } else if (isDirectory(path.join(packageDir, entry))) {
      patterns.push(`${entry}/**/*.{js,mjs,cjs}`);
    }
    // Plain filenames (LICENSE, README.md, package.json, ...) ship no JS.
  }
  return patterns;
}

/**
 * Relative paths of the JS files that would be published.
 * @param {string} packageDir
 * @returns {string[]}
 */
function collectBundleFiles(packageDir) {
  try {
    return fg.sync(bundleGlobs(packageDir), {
      cwd: packageDir,
      ignore: DEFAULT_IGNORES,
      onlyFiles: true,
      dot: false,
      absolute: false,
      followSymbolicLinks: false,
    });
  } catch {
    return [];
  }
}

/**
 * Scan a plugin's published JS for packages the Orderly One host does not
 * provide. Never throws: an unreadable file is skipped.
 * @param {string} packageDir
 * @returns {{ filesChecked: number, unexpected: string[] }}
 */
function checkPluginBundle(packageDir) {
  const files = collectBundleFiles(packageDir);
  const unexpected = new Set();
  for (const relative of files) {
    let source;
    try {
      source = fs.readFileSync(path.join(packageDir, relative), "utf-8");
    } catch {
      continue;
    }
    for (const specifier of scanBareImports(source)) {
      if (!isHostProvidedPeer(specifier)) unexpected.add(specifier);
    }
  }
  return { filesChecked: files.length, unexpected: [...unexpected].sort() };
}

/**
 * Human-readable warning for a bundle that cannot run as a runtime plugin.
 * @param {string[]} unexpected
 * @returns {string}
 */
function formatRuntimePluginWarning(unexpected) {
  const shown = unexpected.slice(0, 5).join(", ");
  const more = unexpected.length > 5 ? ` (+${unexpected.length - 5} more)` : "";
  return [
    "This plugin cannot be installed as a runtime plugin in Orderly One DEXes:",
    `its published build imports packages the host does not provide (${shown}${more}).`,
    "Orderly One only resolves react, react-dom and @orderly.network/* at runtime;",
    "bundle the other packages into the plugin build (e.g. tsup `noExternal`).",
    "Submission is not blocked — the plugin still works in hosts that bundle it at build time.",
  ].join("\n");
}

module.exports = {
  scanBareImports,
  collectBundleFiles,
  checkPluginBundle,
  formatRuntimePluginWarning,
};
