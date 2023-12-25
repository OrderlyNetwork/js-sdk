import path from "node:path";
import fs from "fs-extra";
import fg from "fast-glob";
import Handlebars from "handlebars";
import { BaseBuilder } from "../../baseBuilder";
// import kleur from "kleur";

class NextCreator extends BaseBuilder {
  get templateDir(): string {
    // return `/Users/leo/orderly/orderly-web/packages/create-orderly-app/templates/next`;
    return path.resolve(__dirname, "../templates/next");
  }
  async saveConfigFile(file: string): Promise<any> {
    await fs.writeFile(
      path.resolve(this.options.fullPath, "orderly.config.ts"),
      file
    );
  }

  showWelcomeMessage(): string {
    return "Start to create Next.js project";
  }

  async createBaseProject(): Promise<any> {
    // await this.copyTemplateFiles(path.resolve(__dirname, "../templates/next"));
    await fs.copy(this.templateDir, this.options.fullPath, {
      filter: (src: string) => {
        const isTemplate = src.endsWith(".handlebars");
        return !isTemplate;
      },
    });
  }

  get startCommand(): string {
    return `dev`;
  }

  async createCustomWalletConnector(): Promise<any> {
    console.log("custom wallet connector");
  }

  async createProjectFiles(): Promise<any> {
    const stream = fg.stream(["**/*.handlebars"], {
      // dot: true,
      cwd: this.templateDir,
    });

    for await (const entry of stream) {
      const file = await fs.readFile(
        path.resolve(this.templateDir, entry as string),
        "utf-8"
      );
      const template = Handlebars.compile(file);

      // await this.saveConfigFile(template(this.parsedConfig));
      await fs.writeFile(
        path.resolve(
          this.options.fullPath,
          (entry as string).replace(".handlebars", "")
        ),
        template(this.parsedConfig)
      );
    }
  }
}

export default NextCreator;
