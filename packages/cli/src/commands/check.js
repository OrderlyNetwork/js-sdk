const path = require("node:path");
const { heading, info, success, warn } = require("../shared");
const { CLI_BIN_NAME } = require("../internal/constants");
const {
  checkPluginBundle,
  formatRuntimePluginWarning,
} = require("../internal/pluginBundleCheck");

module.exports = {
  command: "check",
  describe:
    "Check whether a plugin's published build can be installed as a runtime plugin in Orderly One DEXes (no login required)",
  builder: (yargs) => {
    return yargs
      .option("path", {
        alias: "p",
        type: "string",
        describe:
          "string; path to the plugin directory (default: current directory). Never prompts, so it is safe in CI",
        demandOption: false,
      })
      .option("strict", {
        type: "boolean",
        describe:
          "boolean; exit non-zero when the build cannot run as a runtime plugin (for CI gating). Off by default — this is advisory",
        default: false,
      })
      .example(
        `${CLI_BIN_NAME} check -p ./my-plugin`,
        "Warn about packages the Orderly One host does not provide",
      )
      .example(
        `${CLI_BIN_NAME} check -p ./my-plugin --strict`,
        "Fail in CI on non-host imports",
      );
  },
  handler: async (argv) => {
    heading("Runtime plugin compatibility");
    const pluginDir = path.resolve(argv.path || "./");
    info(`Scanning the published build in ${pluginDir}...`);

    const { filesChecked, unexpected } = checkPluginBundle(pluginDir);

    if (filesChecked === 0) {
      warn(
        "No published JavaScript found — build the plugin first, or pass the package root with --path.",
      );
      return;
    }

    if (unexpected.length === 0) {
      success(
        `OK — ${filesChecked} file(s) scanned; every import is host-provided (react, react-dom, @orderly.network/*).`,
      );
      return;
    }

    warn(formatRuntimePluginWarning(unexpected));
    info(
      "Advisory only: hosts that bundle the plugin at build time are unaffected.",
    );
    if (argv.strict) {
      process.exitCode = 1;
    }
  },
};
