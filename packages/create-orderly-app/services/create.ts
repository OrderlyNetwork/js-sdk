import ora from "ora";
import kleur from "kleur";

// create app schedule service
import { CreateAppOptions } from "./types";
// import { AppCreatorManager } from "./appCreatorManager";
import { AppCreator } from "./appCreator";

export async function create(options: CreateAppOptions) {
  const creator = new AppCreator(options);
  const spinner = ora("checking configuration...").start();
  try {
    await creator.prepare();
    spinner.succeed("configuration check passed");
    spinner.start("creating project...");

    await creator.create();
    spinner.succeed("project created");
    spinner.start("installing dependencies, this might take a while...");

    if (!options.skipInstall) {
      await creator.installDependencies();
      spinner.succeed("dependencies installed");
      spinner.succeed(kleur.green("create project successfully"));
    }

    spinner.stop();

    const successMessage = creator.showSuccessMessage();
    if (!!successMessage) {
      console.log(successMessage);
    }
  } catch (e) {
    // console.log(e);
    spinner.fail(kleur.red("create project failed"));
    if (e instanceof Error) {
      // spinner.fail(e.message);

      // console.log(kleur.red(`Error: ${e.message}`));
      console.log(kleur.gray(e.stack ?? ""));
    } else if (typeof e === "string") {
      // spinner.fail(e);
      console.log(kleur.red(`Error: ${e}`));
    }
  }
}
