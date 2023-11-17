import fs from "fs";
import path from "path";
import decamelize from "decamelize";
import { ProjectParser } from "./projectParser";
import { encodeName } from "./name";

export class ParserServer {
  private static _instance: ParserServer;

  private static _modules = [
    "@orderly.network/core",
    "@orderly.network/perp",
    "@orderly.network/hooks",
    "@orderly.network/net",
    "@orderly.network/types",
    "@orderly.network/utils",
  ];

  parser: ProjectParser;

  static getInstance(): ParserServer {
    if (!ParserServer._instance) {
      ParserServer._instance = new ParserServer();
    }

    return ParserServer._instance;
  }

  constructor() {
    const json = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "_doc_meta_/documentation.json"),
        "utf-8"
      )
    );
    this.parser = new ProjectParser({ data: json });
  }

  getCategories() {
    const json = this.parser.toJSON();

    return json.modules
      .filter((module) => ParserServer._modules.includes(module.name))
      .map((module) => {
        return {
          name: module.name,
          id: module.id,
          slug: encodeName(module.name),
          children: [
            ...this.pickChildrenInfo(module.namespaces, "namespaces"),
            ...this.pickChildrenInfo(module.classes, "class"),
            ...this.pickChildrenInfo(module.interfaces, "interface"),
            ...this.pickChildrenInfo(module.functions, "function"),
            ...this.pickChildrenInfo(module.enums, "enum"),
            ...this.pickChildrenInfo(module.variables, "variables"),
            ...this.pickChildrenInfo(module.typeAliases, "typeAliases"),
          ],
        };
      });
  }

  private pickChildrenInfo(children: any[], type: string) {
    return children.map((child) => {
      return {
        id: child.id,
        name: child.name,
        slug: encodeName(child.name),
        type,
      };
    });
  }
}
