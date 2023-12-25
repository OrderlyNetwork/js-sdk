import { IBuilder } from "./iBuilder";
import { CreateAppOptions } from "./types";
import EventEmitter from "node:events";
import path from "node:path";
import fs from "fs-extra";
import kleur from "kleur";
import { whichPm } from "./npm";
import pkg from "../package.json";
import { WalletConnector } from "./wallets";
// import { configCompiled } from "./templates";
import Handlebars from "handlebars";

export abstract class BaseBuilder implements IBuilder {
  constructor(protected readonly options: CreateAppOptions) {}

  protected get orderlyVersion(): {
    "@orderly.network/react": string;
    "@orderly.network/web3-onboard": string;
  } {
    return pkg.orderly.version;
  }

  async configure(): Promise<any> {
    await this.createConfigFile();
  }

  abstract createProjectFiles(): Promise<any>;

  createBaseProject(): Promise<any> {
    return Promise.resolve(undefined);
  }

  showWelcomeMessage(): string {
    return "";
  }

  protected async copyTemplateFiles(templateDir: string) {
    await fs.copy(templateDir, this.options.fullPath);
  }

  get pm() {
    return whichPm();
  }

  showSuccessMessage(): string {
    const items: string[] = [];
    let msg = "";

    if (this.options.brokerId?.toLowerCase() === "orderly") {
      items.push("Add your brokerId");
    }

    if (this.options.walletConnector === WalletConnector.custom) {
      items.push("Implementing custom wallet connector");
    } else if (this.options.walletConnector === WalletConnector.blockNative) {
      items.push("Setup your blockNative API key");
    }

    if (items.length) {
      msg +=
        `\nYou will also need to complete the following configuration:` +
        "\n\n" +
        items
          .map((item: string, index: number) =>
            kleur.yellow(`    ${index + 1}: ${item}`)
          )
          .join("\n") +
        "\n\n" +
        `Please refer to ${kleur
          .italic()
          .grey(
            "https://sdk.orderly.network/components/configuration"
          )} for more information.`;
    }

    return (
      msg +
      `\n\n` +
      `Begin development with the following command:\n\n` +
      `    ${kleur.cyan("cd")} ${this.options.name}\n` +
      `    ${kleur.cyan(this.runCommandString)} ${this.startCommand}\n`
    );
  }

  private get runCommandString(): string {
    switch (this.pm) {
      case "npm":
        return "npm run";
      case "yarn":
        return "yarn";
      case "pnpm":
        return "pnpm run";
      default:
        return "npm run";
    }
  }

  private async createConfigFile() {
    const file = await fs.readFile(
      path.resolve(__dirname, "../templates/shared/config.handlebars"),
      // path.resolve(process.cwd(), "templates/shared/config.handlebars"),
      "utf8"
    );

    const template = Handlebars.compile(file);

    const configFile = template(this.parsedConfig);

    await this.saveConfigFile(configFile);
  }

  protected get parsedConfig() {
    const dependencies: { name: string; version: string }[] = [
      {
        name: "@orderly.network/react",
        version: this.orderlyVersion["@orderly.network/react"],
      },
    ];

    if (this.options.walletConnector === WalletConnector.blockNative) {
      dependencies.push({
        name: "@orderly.network/web3-onboard",
        version: this.orderlyVersion["@orderly.network/web3-onboard"],
      });
    }

    return {
      // walletConnector: this.options.walletConnector,
      ...this.options,
      blockNative: this.options.walletConnector === WalletConnector.blockNative,
      tradingPage: this.options.pages?.includes("trading"),
      dependencies,
    };
  }

  abstract get startCommand(): string;
  abstract createCustomWalletConnector(): Promise<any>;
  abstract saveConfigFile(file: string): Promise<any>;
}
