const path = require("path");
const fs = require("fs");
const { heading, info, success, warn, error } = require("../shared");
const {
  deriveInstallMetadata,
  formatHostPeerSuggestions,
  formatRepositorySuggestion,
  readConfigSchemaFile,
  writeDerivedSchema,
} = require("../internal/pluginConfigSchema");
const { getRepoUrl } = require("../internal/manifest");

module.exports = {
  command: "schema",
  describe:
    "Derive and validate a plugin's configSchema.json from source (no login required)",
  builder: (yargs) => {
    return yargs
      .option("path", {
        alias: "p",
        type: "string",
        describe:
          "string; path to the plugin directory. If omitted, you'll be prompted (default: ./)",
        demandOption: false,
      })
      .option("write", {
        alias: "w",
        type: "boolean",
        describe:
          "boolean; write the derived schema to configSchema.json when the file is missing",
        default: false,
      })
      .example(
        "orderly-devkit schema --path ./my-plugin",
        "Print the derived config schema and install metadata",
      )
      .example(
        "orderly-devkit schema --path ./my-plugin --write",
        "Write the derived schema to configSchema.json",
      );
  },
  handler: async (argv) => {
    heading("Plugin Config Schema");
    const { input } = require("../shared");
    const targetPath = argv.path || (await input("Path to plugin:", "./"));
    const resolvedPath = path.resolve(targetPath);

    if (!fs.existsSync(path.join(resolvedPath, "package.json"))) {
      error(`No package.json found in ${resolvedPath}.`);
      process.exitCode = 1;
      return;
    }

    const checkedIn = readConfigSchemaFile(resolvedPath);
    if (checkedIn.status === "invalid") {
      error("configSchema.json is invalid. Please fix the following issues:");
      checkedIn.errors.forEach((e) => info(`  - ${e}`));
      process.exitCode = 1;
      return;
    }

    const meta = deriveInstallMetadata(resolvedPath);
    meta.warnings.forEach((w) => warn(w));
    if (meta.registerExport) {
      info(`Register export: ${meta.registerExport}`);
    }
    if (meta.repositoryUrl) {
      info(`Repository: ${meta.repositoryUrl}`);
    }
    if (meta.slots.length > 0) {
      info(`Interceptor slots: ${meta.slots.join(", ")}`);
    }
    if (meta.orderlyVersion) {
      info(`Orderly version: ${meta.orderlyVersion}`);
    }
    info(`Built styles: ${meta.hasStyles ?? "unknown"}`);
    const peers = Object.entries(meta.peerDependencies ?? {});
    if (peers.length > 0) {
      const isHostPeer = (name) =>
        name === "react" ||
        name === "react-dom" ||
        name.startsWith("react/") ||
        name.startsWith("react-dom/") ||
        name.startsWith("@orderly.network/");
      const host = peers.filter(([name]) => isHostPeer(name));
      const extra = peers.filter(([name]) => !isHostPeer(name));
      if (host.length > 0) {
        info(
          `Provided by Orderly One: ${host
            .map(([name, range]) => `${name}@${range}`)
            .join(", ")}`,
        );
      }
      if (extra.length > 0) {
        info(
          `Installed with plugin (pinned automatically): ${extra
            .map(([name, range]) => `${name}@${range}`)
            .join(", ")}`,
        );
      }
    }

    if (argv.write) {
      // Writing finalizes the plugin for submission; a missing repository in
      // the published package makes the Marketplace reject it, so fail here
      // instead of after a publish.
      if (!meta.repositoryUrl) {
        error(
          [
            "Cannot write: package.json has no repository field.",
            "Add this to package.json:",
            `  ${formatRepositorySuggestion(getRepoUrl())}`,
            "then publish a new version before submitting.",
          ].join("\n"),
        );
        process.exitCode = 1;
        return;
      }
      // Exact pins on host-provided peers make the DEX deploy merge fail
      // closed (the host supplies its own SDK version), so block finalizing.
      if (meta.pinnedHostPeers.length > 0) {
        error(
          [
            "Cannot write: host-provided peers are pinned to exact versions.",
            "Use ranges instead:",
            ...formatHostPeerSuggestions(meta.pinnedHostPeers),
            "then publish a new version before submitting.",
          ].join("\n"),
        );
        process.exitCode = 1;
        return;
      }
      if (checkedIn.status === "valid") {
        info("configSchema.json already exists and is valid, nothing to do.");
      } else if (meta.configSchema) {
        const written = writeDerivedSchema(resolvedPath, meta.configSchema);
        if (written.written) {
          success("Wrote derived schema to configSchema.json");
          if (written.filesUpdated) {
            info("Added configSchema.json to package.json files.");
          }
        } else {
          warn(written.reason);
        }
      } else {
        warn("No configurable options detected, nothing to write.");
      }
      return;
    }

    if (meta.configSchema) {
      console.log(JSON.stringify(meta.configSchema, null, 2));
    } else {
      warn("No configurable options detected.");
    }
  },
};
