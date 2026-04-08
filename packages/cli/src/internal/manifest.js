const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const MANIFEST_FILENAME = ".orderly-manifest.json";

/**
 * 从 git remote 获取 repoUrl
 */
function getRepoUrl() {
  try {
    // Use execSync with git command - safer approach
    const remoteUrl = execSync("git remote get-url origin", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    }).trim();

    // Convert git@github.com:user/repo.git to https://github.com/user/repo
    if (remoteUrl.startsWith("git@")) {
      return remoteUrl
        .replace("git@", "")
        .replace(":", "/")
        .replace(".git", "");
    }

    // Remove .git suffix if present
    return remoteUrl.replace(/\.git$/, "");
  } catch (e) {
    return null;
  }
}

/**
 * 从 package.json 读取 npmName
 */
function getNpmName(packageJsonPath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return packageJson.name || null;
  } catch (e) {
    return null;
  }
}

/**
 * 生成 manifest 文件
 * @param {string} pluginDir - 插件目录
 * @param {Object} pluginInfo - 插件信息 (pluginId, tags, storybookUrl 等)
 */
function generateManifest(pluginDir, pluginInfo = {}) {
  const packageJsonPath = path.join(pluginDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error("package.json not found in plugin directory");
  }

  const manifest = {
    npmName: getNpmName(packageJsonPath),
    pluginId: pluginInfo.pluginId || null,
    repoUrl: pluginInfo.repoUrl || getRepoUrl() || null,
    tags: pluginInfo.tags || [],
    storybookUrl: pluginInfo.storybookUrl || null,
    storybookTooltip: pluginInfo.storybookTooltip || null,
    usagePrompt: pluginInfo.usagePrompt || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const manifestPath = path.join(pluginDir, MANIFEST_FILENAME);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return manifest;
}

/**
 * 读取 manifest 文件
 * @param {string} pluginDir - 插件目录
 * @returns {Object|null} manifest 对象，如果不存在则返回 null
 */
function readManifest(pluginDir) {
  const manifestPath = path.join(pluginDir, MANIFEST_FILENAME);

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch (e) {
    console.warn(
      `Warning: Failed to parse ${MANIFEST_FILENAME}: ${e.message}. Ignoring corrupted manifest.`,
    );
    return null;
  }
}

/**
 * Resolve plugin metadata for submit: use `.orderly-manifest.json` when present,
 * otherwise derive from `package.json` and git (manual plugins may skip the manifest).
 * @param {string} pluginDir - Plugin root directory
 * @returns {Object|null} Manifest-shaped object, or null if no manifest and no package.json
 */
function resolvePluginManifest(pluginDir) {
  const fromFile = readManifest(pluginDir);
  if (fromFile) {
    return fromFile;
  }

  const packageJsonPath = path.join(pluginDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  return {
    npmName: getNpmName(packageJsonPath),
    pluginId: null,
    repoUrl: getRepoUrl(),
    tags: [],
    storybookUrl: null,
    storybookTooltip: null,
    usagePrompt: null,
    coverImages: [],
  };
}

/**
 * 更新 manifest 文件中的字段
 * @param {string} pluginDir - 插件目录
 * @param {Object} updates - 要更新的字段
 */
function updateManifest(pluginDir, updates) {
  const manifestPath = path.join(pluginDir, MANIFEST_FILENAME);
  const manifest = readManifest(pluginDir);

  if (!manifest) {
    throw new Error(
      "Manifest file not found. Run 'orderly create plugin' first.",
    );
  }

  const updatedManifest = {
    ...manifest,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));

  return updatedManifest;
}

/**
 * 检查 manifest 是否包含必需的提交字段
 * @param {string} pluginDir - 插件目录
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateManifest(pluginDir) {
  const manifest = readManifest(pluginDir);
  const missing = [];

  if (!manifest) {
    return { valid: false, missing: ["manifest file not found"] };
  }

  if (!manifest.npmName) {
    missing.push("npmName (from package.json)");
  }

  if (!manifest.repoUrl) {
    missing.push("repoUrl (configure git remote or run in git repository)");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

module.exports = {
  MANIFEST_FILENAME,
  getRepoUrl,
  getNpmName,
  generateManifest,
  readManifest,
  resolvePluginManifest,
  updateManifest,
  validateManifest,
};
