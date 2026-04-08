module.exports = {
  command: "install-skill",
  describe: "Install a skill from Orderly Marketplace",
  builder: (yargs) => {
    return yargs
      .option("name", {
        alias: "n",
        type: "string",
        describe:
          "string; skill name to install. Note: this command is currently not implemented and will exit with an error",
        demandOption: true,
      })
      .example(
        "orderly install-skill my-skill",
        "Attempt to install a skill (currently not implemented)",
      );
  },
  handler: async (argv) => {
    console.log("orderly install-skill is not yet implemented.");
    console.log("Please check the documentation for updates.");
    process.exitCode = 1;
  },
};
