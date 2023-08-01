exports.command = "pull";

exports.describe = "Pull theme from the theming build portal";

exports.builder = (yargs) => {
  yargs.option("themeId", {
    alias: "id",
    describe: "theme id",
    type: "string",
    demandOption: true,
  });
};

exports.handler = (argv) => {
  console.log("pull:::::", argv);
};
