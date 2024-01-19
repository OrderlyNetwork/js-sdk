import {
  ClassParser,
  EnumParser,
  FunctionParser,
  InterfaceParser,
  NamespaceParser,
  TypeAliasParser,
  VariableParser,
  ReflectionKind,
  reflectionKindToString,
} from "@orderly.network/typedoc-json-parser";
import { type SearchResult } from "@orderly.network/typedoc-json-parser";
// import { bold, red, yellow } from 'colorette';
import type { JSONOutput } from "typedoc";
import { ModuleParser } from "./moduleParser";

/**
 * Parses data from `JSONOutput.ProjectReflection` or {@link ProjectParser.Json}
 * @since 1.0.0
 */
export class ProjectParser {
  /**
   * The version of `@orderly.network/typedoc-json-parser` used to generate this project.
   * @since 1.0.0
   */

  public readonly typeDocJsonParserVersion: string = ProjectParser.version;

  /**
   * The identifier of this project. This is usually `0`
   * @since 1.0.0
   */
  public readonly id: number;

  /**
   * The name of your project.
   *
   * Corresponds to the `name` property in your TypeDoc configuration or the `name` property of your `package.json` file.
   * @since 1.0.0
   */
  public readonly name: string;

  /**
   * The version of the project being parsed.
   *
   * Corresponds to the `version` property in your `package.json`
   * @since 2.2.0
   */
  public readonly version: string | null;

  /**
   * The readme content of this project.
   * @since 3.0.0
   */
  public readonly readme: string | null;

  /**
   * The changelog of this project.
   * @since 3.2.0
   */
  public changelog: string | null;

  public readonly modules: ModuleParser[];

  public constructor(options: ProjectParser.Options) {
    const { data, version, readme, changelog } = options;
    const { id, name } = data;

    this.id = id;
    this.name = name;

    const { kind, children = [] } = data;

    if (kind !== ReflectionKind.Project) {
      throw new Error(
        `Expected Project (${
          ReflectionKind.Project
        }), but received ${reflectionKindToString(kind)} (${kind})`
      );
    }

    this.version = version ?? null;
    this.readme = readme ?? null;
    this.changelog = changelog ?? null;

    this.modules = children
      .filter((child) => child.kind === ReflectionKind.Module)
      .filter((child) => child.name.startsWith("@"))
      .map((child) => ModuleParser.generateFromTypeDoc(child, null));
  }

  public get children(): (
    | ClassParser
    | EnumParser
    | FunctionParser
    | InterfaceParser
    | NamespaceParser
    | TypeAliasParser
    | VariableParser
  )[] {
    return this.modules
      .map((module) => [
        ...module.classes,
        ...module.enums,
        ...module.functions,
        ...module.interfaces,
        ...module.namespaces,
        ...module.typeAliases,
        ...module.variables,
      ])
      .flat();
  }

  /**
   * Find a parser by id.
   * @since 3.0.0
   * @param id The id of the parser to find.
   * @returns The parser with the given id, or `null` if none was found.
   */
  public find(id: number): SearchResult | null {
    id = Number(id);
    for (const module of this.modules) {
      if (module.id === id) return module;

      const result = module.find(id);
      if (result) return result;
    }

    return null;
  }

  // segment: [module,class|enum|function|interface|namespace|typeAlias|variable, name]
  public findByPath(segments: string[]): SearchResult | null {
    const moduleName = segments.shift();
    const module = this.modules.find((module) => {
      return module.name === moduleName;
    });

    if (!module) return null;

    if (!segments.length) return module;

    const kinds = segments.shift();

    if (!Array.isArray(kinds)) return null;

    let subKind = kinds.shift();
    // const subKind = kind[0];

    const subModule = module.findByName(subKind);

    if (!kinds.length) {
      return subModule;
    }

    let child: SearchResult | null = null;

    while (kinds.length) {
      // console.log("subModule", subModule);
      const kind = kinds.shift();
      child = subModule.result.search(kind);

      if (!child || !Array.isArray(child) || child.length === 0) return null;

      if (!kinds.length) {
        return { result: child[0], type: child[0].constructor.name };
      }
    }

    // console.log("subKind", subKind);
    //
    // const child = module.findByName(subKind);
    //
    // if (child) {
    //   child.parent = module;
    // }
    //
    // return child;

    // return module.findByPath(segments);
  }

  /**
   * Search for a parser with a given query.
   * @since 3.0.0
   * @param query The query to search with.
   * @returns An array of search results.
   */
  public search(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const words = query
      .toLowerCase()
      .split(/(#|\.)/g)
      .filter((word) => word !== "." && word !== "#");

    for (let index = 0; index < this.modules.length; index++) {
      const module = this.modules[index];

      return module.search(query);
    }

    return results;
  }

  /**
   * Converts this project to a json compatible format.
   * @since 1.0.0
   * @returns The json compatible format of this project.
   */
  public toJSON(): ProjectParser.Json {
    return {
      typeDocJsonParserVersion: this.typeDocJsonParserVersion,
      id: this.id,
      name: this.name,
      version: this.version,
      readme: this.readme,
      changelog: this.changelog,
      modules: this.modules.map((parser) => parser.toJSON()),
    };
  }

  public static version = "[@versionInjector]";
}

export namespace ProjectParser {
  export interface Options {
    /**
     * The data for this project.
     * @since 3.0.0
     */
    data: JSONOutput.ProjectReflection;

    /**
     * The version of the project being parsed.
     * @since 3.0.0
     */
    version?: string;

    /**
     * The readme content of this project.
     * @since 3.0.0
     */
    readme?: string;

    /**
     * The changelog content of this project.
     * @since 3.2.0
     */
    changelog?: string;
  }

  export interface Json {
    /**
     * The version of `typedoc-json-parser` that generated this Json object.
     * @since 2.1.0
     */
    typeDocJsonParserVersion: string;

    /**
     * The identifier of this project. This is usually `0`
     * @since 1.0.0
     */
    id: number;

    /**
     * The name of your project.
     *
     * Corresponds to the `name` property in your TypeDoc configuration or the `name` property of your `package.json` file.
     * @since 1.0.0
     */
    name: string;

    /**
     * The version of the project being parsed.
     *
     * Corresponds to the `version` property in your `package.json`
     * @since 2.2.0
     */
    version: string | null;

    /**
     * The readme content of this project.
     * @since 3.0.0
     */
    readme: string | null;

    /**
     * The changelog content of this project.
     * @since 3.2.0
     */
    changelog: string | null;

    modules: ModuleParser.Json[];
  }
}
