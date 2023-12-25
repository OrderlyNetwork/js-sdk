import fs from "fs-extra";
import kleur from "kleur";

import { CreateAppOptions } from "./types";
import appCreatorManager from "./appCreatorManager";
import { IBuilder } from "./iBuilder";
import { installDependencies, whichPm } from "./npm";

export class AppCreator {
  private creator?: IBuilder | null;
  constructor(private readonly options: CreateAppOptions) {
    this.creator = appCreatorManager.getCreator(this.options);
  }

  async prepare() {
    if (!this.creator) {
      throw new Error("Not supported framework");
    }

    await this.validateOptions();
  }

  async create(): Promise<any> {
    // return Promise.resolve(undefined);

    if (!this.creator) {
      throw new Error("Not supported framework");
    }

    // 1. create the project base structure, like: package.json, src folder, etc.
    // usually, use the third-party cli tool to create the project
    await this.creator.createBaseProject();

    // 2. configure the project, like: dependencies, create files, etc.
    await this.creator.configure();

    // 3. create project files, like: trading page, profile page, etc.
    await this.creator.createProjectFiles();
  }

  private async validateOptions() {
    if (this.options.mode === "new") {
      // await this.validateProjectName(this.options.name);
      await this.validateProjectPath(this.options.fullPath);
    }
  }

  private async createPathFolder() {
    await fs.ensureDir(this.options.fullPath);
  }

  private async validateProjectName(name: string) {
    // const result = validateNpmPackageName(name);
    // // console.log("------>>>>", result);
    // if (!result.validForNewPackages) {
    //   throw new Error(`Invalid project name: ${name}`);
    // }
  }

  private async validateProjectPath(path: string) {
    // if the path exists, throw error
    const exists = await fs.pathExists(path);

    if (exists) {
      throw new Error("The project path already exists");
    }
  }

  async installDependencies(): Promise<void> {
    try {
      await installDependencies({
        rootPath: this.options.fullPath,
      });
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        throw e.message;
      }

      throw e;
    }

    // if (stderr) {
    //   throw new Error(stderr);
    // }
  }

  showSuccessMessage(): string {
    const msg = this.creator?.showSuccessMessage() || "";

    return `\n===========================\n` + `${msg}`;
  }
}
