import fs from "fs";
import EventEmitter from "node:events";
import { IBuilder } from "./iBuilder";
import { CreateAppOptions } from "./types";

export class AppCreatorManager extends EventEmitter {
  static EVENTS = {
    "createProject:start": "createProject:start",
    "createProject:success": "createProject:success",
    "configure:success": "configure:success",
    message: "message",
  };
  private projectBuilder: Map<
    string,
    {
      creator: {
        new (options: CreateAppOptions): IBuilder;
      };
      name: string;
    }
  > = new Map();

  constructor() {
    super();
    // this.options = options;
    // this.#projectPath = `./${options.name}`;
  }

  registerBuilder(
    frameworkId: string,
    name: string,
    builder: { new (): IBuilder }
  ) {
    this.projectBuilder.set(frameworkId, { creator: builder, name });
  }

  private validateBuilder(builder: IBuilder): string | undefined {
    // const _builder= new builder();

    return;
  }

  getCreator(options: CreateAppOptions) {
    return this.factory(options);
  }

  private factory(options: CreateAppOptions) {
    const { framework } = options;
    const builder = this.projectBuilder.get(framework);
    if (!builder) {
      return null;
    }
    return new builder.creator(options);
  }

  generateCode(options: CreateAppOptions) {
    const { framework, brokerId } = options;

    this.beforeGenerate(framework);
  }

  private beforeGenerate(frameworkId: string) {}

  get frameworks() {
    // return Array.from(this.projectBuilder.keys());
    const keys = Array.from(this.projectBuilder.keys());
    return keys.map((key) => {
      return {
        id: key,
        name: this.projectBuilder.get(key)!.name,
      };
    });
  }
}

const appCreatorManager = new AppCreatorManager();

appCreatorManager.registerBuilder(
  "next.js",
  "Next.js",
  require("./frameworks/next/creator").default
);

appCreatorManager.registerBuilder(
  "cra",
  "CRA(Create React App)",
  require("./frameworks/cra/creator").default
);

export default appCreatorManager;
