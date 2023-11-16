import {
  ClassParser,
  EnumParser,
  FunctionParser,
  InterfaceParser,
  NamespaceParser,
  TypeAliasParser,
  VariableParser,
  ReflectionKind,
  //   CommentParser,
  reflectionKindToString,
} from "typedoc-json-parser";
// import { type SearchResult } from "typedoc-json-parser";
// import { bold, red, yellow } from 'colorette';
import { type SearchResult } from "typedoc-json-parser";
import type { JSONOutput } from "typedoc";
import { CommentParser } from "./commentParser";
import { SourceParser } from "./sourceParser";
import decamelize from "decamelize";
import { encodeName } from "./name";

/**
 * Parses data from `JSONOutput.ProjectReflection` or {@link ProjectParser.Json}
 * @since 1.0.0
 */
export class ModuleParser {
  public readonly id: number;

  public readonly name: string;

  public readonly slug: string;

  //   public readonly comment: CommentParser;
  public readonly comment: CommentParser;
  /**
   * Whether this namespace is external.
   * @since 1.0.0
   */
  public readonly external: boolean;

  /**
   * An array of class parsers for this project.
   * @since 1.0.0
   */
  public readonly classes: ClassParser[];

  /**
   * An array of enum parsers for this project.
   * @since 1.0.0
   */
  public readonly enums: EnumParser[];

  /**
   * An array of function parsers for this project.
   * @since 1.0.0
   */
  public readonly functions: FunctionParser[];

  /**
   * An array of interface parsers for this project.
   * @since 1.0.0
   */
  public readonly interfaces: InterfaceParser[];

  /**
   * An array of namespace parsers for this project.
   * @since 1.0.0
   */
  public readonly namespaces: NamespaceParser[];

  /**
   * An array of type alias parsers for this project.
   * @since 1.0.0
   */
  public readonly typeAliases: TypeAliasParser[];

  /**
   * An array of variable parsers for this project.
   * @since 1.0.0
   */
  public readonly variables: VariableParser[];

  public constructor(data: any) {
    //   super(data);
    // const { data, version, readme, changelog } = options;
    const { id, name } = data;

    this.id = id;
    this.name = name;
    this.slug = encodeName(name);

    const {
      namespaceParentId,
      //   id,
      comment,
      external,
      classes,
      enums,
      functions,
      interfaces,
      namespaces,
      typeAliases,
      variables,
    } = data;

    // this.namespaceParentId = namespaceParentId;
    this.id = id;
    this.comment = comment;
    this.external = external;
    this.classes = classes;
    this.enums = enums;
    this.functions = functions;
    this.interfaces = interfaces;
    this.namespaces = namespaces;
    this.typeAliases = typeAliases;
    this.variables = variables;
  }

  public static generateFromTypeDoc(
    reflection: JSONOutput.DeclarationReflection,
    namespaceParentId: number | null
  ): ClassParser {
    const {
      kind,
      id,
      name,
      comment = { summary: [] },
      sources = [],
      flags,
      children = [],
    } = reflection;

    if (kind !== ReflectionKind.Module) {
      throw new Error(
        `Expected Module (${
          ReflectionKind.Module
        }), but received ${reflectionKindToString(
          kind
        )} (${kind}). NAME=${name};ID=${id}`
      );
    }

    const classes = children
      .filter((child) => child.kind === ReflectionKind.Class)
      .map((child) => ClassParser.generateFromTypeDoc(child, id));
    const enums = children
      .filter((child) => child.kind === ReflectionKind.Enum)
      .map((child) => EnumParser.generateFromTypeDoc(child, id));
    const functions = children
      .filter((child) => child.kind === ReflectionKind.Function)
      .map((child) => FunctionParser.generateFromTypeDoc(child, id));

    const interfaces = children
      .filter((child) => child.kind === ReflectionKind.Interface)
      .map((child) => InterfaceParser.generateFromTypeDoc(child, id));

    const namespaces = children
      .filter((child) => child.kind === ReflectionKind.Namespace)
      .map((child) => NamespaceParser.generateFromTypeDoc(child, id));

    const typeAliases = children
      .filter((child) => child.kind === ReflectionKind.TypeAlias)
      .map((child) => TypeAliasParser.generateFromTypeDoc(child, id));

    const variables = children
      .filter((child) => child.kind === ReflectionKind.Variable)
      .map((child) => VariableParser.generateFromTypeDoc(child, id));

    console.log("----->>>>", name);

    return new ModuleParser({
      id,
      name,
      namespaceParentId,
      comment: CommentParser.generateFromTypeDoc(comment),
      source: sources.length
        ? SourceParser.generateFromTypeDoc(sources[0])
        : null,
      external: Boolean(flags.isExternal),
      classes,
      enums,
      functions,
      interfaces,
      namespaces,
      typeAliases,
      variables,
    });
  }

  /**
   * Converts this project to a json compatible format.
   * @since 1.0.0
   * @returns The json compatible format of this project.
   */
  public toJSON(): ModuleParser.Json {
    return {
      //   typeDocJsonParserVersion: this.typeDocJsonParserVersion,
      id: this.id,
      name: this.name,
      slug: this.slug,

      classes: this.classes.map((parser) => parser.toJSON()),
      enums: this.enums.map((parser) => parser.toJSON()),
      functions: this.functions.map((parser) => parser.toJSON()),
      interfaces: this.interfaces.map((parser) => parser.toJSON()),
      namespaces: this.namespaces.map((parser) => parser.toJSON()),
      typeAliases: this.typeAliases.map((parser) => parser.toJSON()),
      variables: this.variables.map((parser) => parser.toJSON()),
    };
  }

  public find(id: number): SearchResult | null {
    for (const classParser of this.classes) {
      if (classParser.id === id) {
        return classParser;
      }

      if (classParser.construct.id === id) {
        return classParser.construct;
      }

      for (const methodParser of classParser.methods) {
        if (methodParser.id === id) {
          return methodParser;
        }

        for (const signature of methodParser.signatures) {
          if (signature.id === id) {
            return signature;
          }

          for (const typeParameter of signature.typeParameters) {
            if (typeParameter.id === id) {
              return typeParameter;
            }
          }

          for (const parameter of signature.parameters) {
            if (parameter.id === id) {
              return parameter;
            }
          }
        }
      }

      for (const propertyParser of classParser.properties) {
        if (propertyParser.id === id) {
          return propertyParser;
        }
      }
    }

    for (const enumParser of this.enums) {
      if (enumParser.id === id) {
        return enumParser;
      }

      for (const propertyParser of enumParser.members) {
        if (propertyParser.id === id) {
          return propertyParser;
        }
      }
    }

    for (const functionParser of this.functions) {
      if (functionParser.id === id) {
        return functionParser;
      }
    }

    for (const interfaceParser of this.interfaces) {
      if (interfaceParser.id === id) {
        return interfaceParser;
      }

      for (const propertyParser of interfaceParser.properties) {
        if (propertyParser.id === id) {
          return propertyParser;
        }
      }
    }

    for (const namespaceParser of this.namespaces) {
      if (namespaceParser.id === id) {
        return namespaceParser;
      }

      const found = namespaceParser.find(id);

      if (found) {
        return found;
      }
    }

    for (const typeAliasParser of this.typeAliases) {
      if (typeAliasParser.id === id) {
        return typeAliasParser;
      }
    }

    for (const variableParser of this.variables) {
      if (variableParser.id === id) {
        return variableParser;
      }
    }

    return null;
  }

  public findByName(name: string): SearchResult | null {
    let result: SearchResult;
    for (const classParser of this.classes) {
      if (classParser.name === name) {
        result = classParser;
      }

      if (classParser.construct.name === name) {
        result = classParser.construct;
      }

      for (const methodParser of classParser.methods) {
        if (methodParser.name === name) {
          result = methodParser;
        }

        for (const signature of methodParser.signatures) {
          if (signature.name === name) {
            result = signature;
          }

          for (const typeParameter of signature.typeParameters) {
            if (typeParameter.name === name) {
              result = typeParameter;
            }
          }

          for (const parameter of signature.parameters) {
            if (parameter.name === name) {
              result = parameter;
            }
          }
        }
      }

      for (const propertyParser of classParser.properties) {
        if (propertyParser.name === name) {
          result = propertyParser;
        }
      }
    }

    for (const enumParser of this.enums) {
      if (enumParser.name === name) {
        result = enumParser;
      }

      for (const propertyParser of enumParser.members) {
        if (propertyParser.name === name) {
          result = propertyParser;
        }
      }
    }

    for (const functionParser of this.functions) {
      if (functionParser.name === name) {
        result = functionParser;
      }
    }

    for (const interfaceParser of this.interfaces) {
      if (interfaceParser.name === name) {
        result = interfaceParser;
      }

      for (const propertyParser of interfaceParser.properties) {
        if (propertyParser.name === name) {
          result = propertyParser;
        }
      }
    }

    for (const namespaceParser of this.namespaces) {
      if (namespaceParser.name === name) {
        result = namespaceParser;
      }

      const found = namespaceParser.find(name);

      if (found) {
        result = found;
      }
    }

    for (const typeAliasParser of this.typeAliases) {
      if (typeAliasParser.name === name) {
        result = typeAliasParser;
      }
    }

    for (const variableParser of this.variables) {
      if (variableParser.name === name) {
        result = variableParser;
      }
    }

    if (result) {
      console.log("type::::::", result.constructor.name);

      return { result, type: result.constructor.name };
    }

    return null;
  }

  public search(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const words = query
      .toLowerCase()
      .split(/(#|\.)/g)
      .filter((word) => word !== "." && word !== "#");

    for (const classParser of this.classes) {
      if (classParser.name.toLowerCase().includes(words[0])) {
        if (words.length === 1) {
          results.push(classParser);

          continue;
        }

        for (const methodParser of classParser.methods) {
          if (methodParser.name.toLowerCase().includes(words[1])) {
            if (words.length === 2) {
              results.push(methodParser);

              continue;
            }
          }
        }

        for (const propertyParser of classParser.properties) {
          if (propertyParser.name.toLowerCase().includes(words[1])) {
            results.push(propertyParser);

            continue;
          }
        }
      }
    }

    for (const enumParser of this.enums) {
      if (enumParser.name.toLowerCase().includes(words[0])) {
        if (words.length === 1) {
          results.push(enumParser);

          continue;
        }

        for (const enumMemberParser of enumParser.members) {
          if (enumMemberParser.name.toLowerCase().includes(words[1])) {
            results.push(enumMemberParser);

            continue;
          }
        }
      }
    }

    for (const functionParser of this.functions) {
      if (functionParser.name.toLowerCase().includes(words[0])) {
        results.push(functionParser);

        continue;
      }
    }

    for (const interfaceParser of this.interfaces) {
      if (interfaceParser.name.toLowerCase().includes(words[0])) {
        if (words.length === 1) {
          results.push(interfaceParser);

          continue;
        }

        for (const propertyParser of interfaceParser.properties) {
          if (propertyParser.name.toLowerCase().includes(words[1])) {
            results.push(propertyParser);

            continue;
          }
        }
      }
    }

    for (const namespaceParser of this.namespaces) {
      if (namespaceParser.name.toLowerCase().includes(words[0])) {
        if (words.length === 1) {
          results.push(namespaceParser);

          continue;
        }

        const subResults = namespaceParser.search(
          query.substring(words[0].length)
        );

        for (const subResult of subResults) {
          results.push(subResult);
        }
      }
    }

    for (const typeAliasParser of this.typeAliases) {
      if (typeAliasParser.name.toLowerCase().includes(words[0])) {
        results.push(typeAliasParser);

        continue;
      }
    }

    for (const variableParser of this.variables) {
      if (variableParser.name.toLowerCase().includes(words[0])) {
        results.push(variableParser);

        continue;
      }
    }

    return results;
  }

  public static version = "[@versionInjector]";
}

export namespace ModuleParser {
  export interface Options {
    /**
     * The data for this project.
     * @since 3.0.0
     */
    data: Json | JSONOutput.ProjectReflection;

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
    // typeDocJsonParserVersion: string;

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

    slug: string;

    /**
     * An array of class Json compatible objects for this project in a json compatible format.
     * @since 1.0.0
     */
    classes: ClassParser.Json[];

    /**
     * An array of enum Json compatible objects for this project in a json compatible format.
     * @since 1.0.0
     */
    enums: EnumParser.Json[];

    /**
     * An array of function Json compatible objects for this project in a json compatible format.
     * @since 1.0.0
     */
    functions: FunctionParser.Json[];

    /**
     * An array of interface Json compatible objects for this project in a json compatible format.
     * @since 1.0.0
     */
    interfaces: InterfaceParser.Json[];

    /**
     * An array of namespace Json compatible objects for this project in a json compatible format.
     * @since 1.0.0
     */
    namespaces: NamespaceParser.Json[];

    /**
     * An array of type alias Json compatible objects for this project in a json compatible format.
     * @since 1.0.0
     */
    typeAliases: TypeAliasParser.Json[];

    /**
     * An array of variable Json compatible objects for this project in a json compatible format.
     * @since 1.0.0
     */
    variables: VariableParser.Json[];
  }
}
