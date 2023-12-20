import { IBuilder } from "./iBuilder";
import { CreateAppOptions } from "./types";
import EventEmitter from "node:events";
import path from "node:path";
import fs from "fs-extra";
import kleur from "kleur";
import { whichPm } from "./npm";
import { WalletConnector } from "./wallets";

export abstract class BaseBuilder implements IBuilder {
  protected constructor(protected readonly options: CreateAppOptions) {}

  async configure(): Promise<any> {
    await this.updatePkg();
  }

  createBaseProject(): Promise<any> {
    return Promise.resolve(undefined);
  }

  showWelcomeMessage(): string {
    return "";
  }

  private async updatePkg() {
    const pkgPath = path.resolve(this.options.fullPath, "package.json");
    let pkg = fs.readJsonSync(pkgPath);

    await this.updatePackageName(pkg);
    await this.updateDependencies(pkg);

    // const sortPackageJson = await import('sort-package-json')

    // console.log("sortPackageJson", sortPackageJson);

    // pkg = sortPackageJson(pkg)

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }

  private updatePackageName(pkg: any): any {
    pkg.name = this.options.name;
    return pkg;
  }

  async configureWalletConnector(pkg: any): Promise<void> {
    if (this.options.walletConnector === WalletConnector.blockNative) {
      pkg.dependencies["@orderly.network/web3-onboard"] = "latest";
    } else if (this.options.walletConnector === WalletConnector.custom) {
      pkg.dependencies["@orderly.network/web3-walletconnect"] = "latest";

      // return pkg;
    }
  }

  async updateDependencies(pkg: any): Promise<void> {
    pkg = await this.configureWalletConnector(pkg);
  }

  protected async copyTemplateFiles(templateDir: string) {
    // const templateDir = path.resolve(__dirname, "../templates/next");

    await fs.copy(templateDir, this.options.fullPath);
  }

  get pm() {
    return whichPm();
  }

  showSuccessMessage(): string {
    const items: string[] = [];
    let msg = "";

    if (this.options.brokerId?.toLowerCase() === "orderly") {
      items.push("Add brokerId");
    }

    if (items.length) {
      msg +=
        `\nYou will also need to complete the following configuration:` +
        "\n\n" +
        items
          .map((item: string, index: number) =>
            kleur.cyan(`    ${index + 1}: ${item}`)
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
      +`\n\n` +
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

  abstract get startCommand(): string;
}
