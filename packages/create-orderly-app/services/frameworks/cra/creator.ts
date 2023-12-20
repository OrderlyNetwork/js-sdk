import kleur from "kleur";
import path from "node:path";
import { BaseBuilder } from "../../baseBuilder";
import { whichPm } from "../../npm";

export default class CRACreator extends BaseBuilder {
  async createBaseProject(): Promise<any> {
    await this.copyTemplateFiles(path.resolve(__dirname, "../templates/cra"));

    return Promise.resolve(undefined);
  }

  get startCommand(): string {
    return `start`;
  }
}
