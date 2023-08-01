exports.command = "theme";

exports.describe = "theme commands";

exports.builder = (yargs) => {
  yargs.commandDir("./theme");
};
exports.handler = (argv) => {
  console.log("theme:::::", argv);
};
