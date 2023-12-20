import path from "node:path";

import { BaseBuilder } from "../../baseBuilder";
import kleur from "kleur";

class NextCreator extends BaseBuilder {
  showWelcomeMessage(): string {
    return "Start to create Next.js project";
  }

  async createBaseProject(): Promise<any> {
    await this.copyTemplateFiles(path.resolve(__dirname, "../templates/next"));

    return Promise.resolve(undefined);
  }

  get startCommand(): string {
    return `dev`;
  }
}

export default NextCreator;
