declare module "markdown-it" {
  import type { MarkdownToken } from "./markdown";
  export default class MarkdownIt {
    constructor(options?: {
      html?: boolean;
      linkify?: boolean;
      breaks?: boolean;
    });
    parse(source: string, env: object): MarkdownToken[];
  }
}
