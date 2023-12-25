// sign message

function handler(argv) {
    console.log("create:::::", argv);
  }
  
  module.exports = {
    command: "sign",
    describe: "create a new Orderly project",
    builder: (yargs) => {
      yargs.option("name", {
        alias: "n",
        describe: "project name",
        type: "string",
        demandOption: true,
      });
      yargs.option("template", {
        alias: "t",
        describe: "project template",
        type: "string",
        demandOption: true,
      });
    },
    handler,
  };
  