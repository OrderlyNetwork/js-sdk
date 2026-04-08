const { input, select, heading, info, success } = require("../../shared");
const { DEX_TEMPLATES } = require("../../internal/constants");

// create dex command - default export for yargs commandDir
module.exports = {
  command: "dex",
  describe: "Create a new DEX project",
  builder: (yargs) => {
    return yargs
      .option("template", {
        alias: "t",
        type: "string",
        choices: DEX_TEMPLATES,
        describe:
          "string; DEX template to use. If omitted, you will be prompted to select one",
        demandOption: false,
      })
      .positional("name", {
        type: "string",
        describe:
          "string; project name (used only for display in the guided flow; actual file generation is currently implemented later)",
        default: "orderly-dex",
      })
      .example(
        "orderly create dex --template basic --name my-dex",
        "Run guided DEX creation and choose a specific template",
      )
      .example(
        "orderly create dex",
        "Run guided DEX creation (prompt for template)",
      );
  },
  handler: async (argv) => {
    heading("Create a New DEX Project");
    info("This command will guide you through creating a new DEX project.\n");

    // Template: use argv or prompt
    const template =
      argv.template || (await select("Select template:", DEX_TEMPLATES, 0));

    console.log("\n--- DEX Creation Details ---");
    console.log("Project name:", argv.name || "orderly-dex");
    console.log("Template:", template);
    console.log("-------------------------\n");

    success("DEX creation flow completed!");
    success(`Project: ${argv.name || "orderly-dex"}`);
    success(`Template: ${template}`);
    console.log("\nNote: Actual file generation will be implemented later.");
  },
};
