#! /usr/bin/env node

// command:
// project create
// theme pull/push
// intl pull/push

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const create = require("../commands/create");

const argv = yargs(hideBin(process.argv))
//   .command(create)
  .commandDir("../commands")
  .demandCommand(1,'You need at least one command before moving on')
  .example('$0 create -n my-project -t react', 'create a new project')
  .help().argv;
