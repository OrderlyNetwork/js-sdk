import ts from "typescript";
import type {
  FunctionEntity,
  HookEntity,
  ResolutionLevel,
  TypeEntity,
} from "./entityTypes.js";
import {
  isPackageSourceFile,
  type PackageTarget,
  createPackageProgram,
} from "./packageProgram.js";
import { relFromRepo } from "./paths.js";

function resolveAliasedSymbol(
  checker: ts.TypeChecker,
  sym: ts.Symbol,
): ts.Symbol {
  if (sym.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(sym);
  }
  return sym;
}

function jsDocCommentToText(
  comment: string | undefined | ts.JSDocComment,
): string {
  if (comment == null) return "";
  if (typeof comment === "string") return comment;
  if (Array.isArray(comment)) {
    return comment.map((c) => (typeof c === "string" ? c : c.text)).join("\n");
  }
  return "text" in comment ? comment.text : "";
}

function getJsDoc(checker: ts.TypeChecker, node: ts.Node): string | undefined {
  const docs = ts.getJSDocCommentsAndTags(node);
  if (!docs.length) return undefined;
  const text = docs
    .filter(ts.isJSDoc)
    .map((d) =>
      jsDocCommentToText(d.comment as Parameters<typeof jsDocCommentToText>[0]),
    )
    .filter(Boolean)
    .join("\n");
  return text || undefined;
}

/** Extracts deprecated marker and message from JSDoc tags in declaration nodes. */
function getDeprecationInfo(node: ts.Node | undefined): {
  deprecated: boolean;
  deprecationMessage?: string;
} {
  if (!node) return { deprecated: false };
  const tags = ts.getJSDocTags(node);
  const deprecatedTag = tags.find(
    (tag) => tag.tagName.getText() === "deprecated",
  );
  if (!deprecatedTag) return { deprecated: false };
  const msg = jsDocCommentToText(
    deprecatedTag.comment as Parameters<typeof jsDocCommentToText>[0],
  ).trim();
  return {
    deprecated: true,
    deprecationMessage: msg || undefined,
  };
}

/** Uses source-path conventions to provide a stable lightweight hook source classification. */
function inferHookSourceTag(
  sourcePath: string,
): HookEntity["sourceTag"] | undefined {
  return sourcePath.includes("/deprecated/") ? "deprecated" : undefined;
}

function describeParameters(
  checker: ts.TypeChecker,
  sig: ts.Signature,
): HookEntity["params"] {
  return sig.parameters.map((param) => {
    const decl = param.valueDeclaration as ts.ParameterDeclaration | undefined;
    const optional = !!decl?.questionToken || !!decl?.initializer;
    const loc = decl ?? sig.getDeclaration();
    return {
      name: param.getName(),
      type: checker.typeToString(checker.getTypeOfSymbolAtLocation(param, loc)),
      optional,
      description:
        param
          .getDocumentationComment(checker)
          .map((p) => p.text)
          .join("\n") || undefined,
    };
  });
}

function describeReturn(checker: ts.TypeChecker, sig: ts.Signature) {
  const ret = sig.getReturnType();
  return {
    type: checker.typeToString(ret),
    description: undefined as string | undefined,
  };
}

/**
 * True when a type string describes a React render tree (elements / nodes), including unions.
 * Used to avoid indexing real components as `function.*` (they belong in `component.*` from react-docgen).
 */
function typeLooksLikeReactRenderTree(
  checker: ts.TypeChecker,
  t: ts.Type,
): boolean {
  if (t.isUnion()) {
    return t.types.some((u) => typeLooksLikeReactRenderTree(checker, u));
  }
  if (t.isIntersection()) {
    return t.types.some((u) => typeLooksLikeReactRenderTree(checker, u));
  }
  if (t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) {
    return false;
  }
  const s = checker.typeToString(t);
  if (/\bJSX\.Element\b/.test(s)) return true;
  if (
    /\bReact\.(ReactElement|ReactNode|ReactChild|ReactFragment|ReactPortal)\b/.test(
      s,
    )
  )
    return true;
  if (/\bReactElement\b/.test(s)) return true;
  if (/\bReactNode\b/.test(s)) return true;
  if (/\bReactPortal\b/.test(s)) return true;
  return false;
}

/**
 * Package exports that are callables but render React trees (FC, forwardRef, Radix roots, etc.)
 * must not be stored as `function.*`: the symbol index uses the short name `Dialog` once, and
 * `function.Dialog` was winning over `component.Dialog` for lookups like orderly_docs_get_component.
 *
 * Factories that *return* `FC<>` / `ComponentType<>` / exotic component types stay as functions.
 */
function shouldExcludeCallableFromFunctionArtifacts(
  checker: ts.TypeChecker,
  sig: ts.Signature,
): boolean {
  const ret = sig.getReturnType();
  const head = checker.typeToString(ret);

  // Higher-order / factory returns — document as plain functions (e.g. createDialogComponent).
  if (/\bComponentType\s*</.test(head)) return false;
  if (/\bFunctionComponent\s*</.test(head) || /\bFC\s*</.test(head))
    return false;
  if (/\bForwardRefExoticComponent\s*</.test(head)) return false;
  if (/\bMemoExoticComponent\s*</.test(head)) return false;
  if (/\bLazyExoticComponent\b/.test(head)) return false;

  return typeLooksLikeReactRenderTree(checker, ret);
}

/**
 * Extract hooks, types, and functions from a single package program (Compiler API, §4.10).
 */
export function extractSymbolsFromProgram(
  program: ts.Program,
  checker: ts.TypeChecker,
  packageAbs: string,
  npmName: string,
  gitSha: string,
  generatedAt: string,
): { hooks: HookEntity[]; types: TypeEntity[]; functions: FunctionEntity[] } {
  const hooks: HookEntity[] = [];
  const types: TypeEntity[] = [];
  const functions: FunctionEntity[] = [];
  const fqSeen = new Set<string>();

  for (const sf of program.getSourceFiles()) {
    if (!isPackageSourceFile(sf, packageAbs)) continue;

    const moduleSym = checker.getSymbolAtLocation(sf);
    if (!moduleSym) continue;

    const exports = checker.getExportsOfModule(moduleSym);
    for (const ex of exports) {
      const sym = resolveAliasedSymbol(checker, ex);
      const name = sym.getName();
      if (name === "default" || name.startsWith("_")) continue;

      let fq: string;
      try {
        fq = checker.getFullyQualifiedName(sym);
      } catch {
        fq = `${npmName}:${name}`;
      }
      if (fqSeen.has(fq)) continue;
      fqSeen.add(fq);

      const decl =
        sym.valueDeclaration ??
        sym.declarations?.[0] ??
        (sym.flags & ts.SymbolFlags.Alias ? sym.declarations?.[0] : undefined);
      const sourcePath = decl
        ? relFromRepo(decl.getSourceFile().fileName)
        : relFromRepo(sf.fileName);

      const symType = checker.getTypeOfSymbol(sym);
      const callSigs = checker.getSignaturesOfType(
        symType,
        ts.SignatureKind.Call,
      );

      if (name.startsWith("use") && callSigs.length) {
        const sig = callSigs[0]!;
        const node = sig.getDeclaration();
        const deprecation = getDeprecationInfo(node);
        const sourceTag = inferHookSourceTag(sourcePath);
        try {
          hooks.push({
            id: `hook.${name}`,
            name,
            artifactKind: "hook",
            gitSha,
            generatedAt,
            sourcePath,
            package: npmName,
            resolutionLevel: "full" satisfies ResolutionLevel,
            params: describeParameters(checker, sig),
            returns: describeReturn(checker, sig),
            jsDoc: node ? getJsDoc(checker, node) : undefined,
            deprecated: deprecation.deprecated || sourceTag === "deprecated",
            deprecationMessage: deprecation.deprecationMessage,
            sourceTag,
          });
        } catch {
          hooks.push({
            id: `hook.${name}`,
            name,
            artifactKind: "hook",
            gitSha,
            generatedAt,
            sourcePath,
            package: npmName,
            resolutionLevel: "partial",
            degradedReason: "UNSUPPORTED_TYPE",
            params: [],
            returns: { type: "unknown" },
            deprecated: deprecation.deprecated || sourceTag === "deprecated",
            deprecationMessage: deprecation.deprecationMessage,
            sourceTag,
          });
        }
        continue;
      }

      if (sym.flags & ts.SymbolFlags.Interface) {
        const declNode = sym.declarations?.[0];
        types.push({
          id: `type.${name}`,
          name,
          kind: "interface",
          artifactKind: "type",
          gitSha,
          generatedAt,
          sourcePath,
          package: npmName,
          typeText: declNode
            ? checker.typeToString(
                checker.getTypeAtLocation(declNode, declNode),
              )
            : undefined,
          jsDoc: declNode ? getJsDoc(checker, declNode) : undefined,
        });
        continue;
      }
      if (sym.flags & ts.SymbolFlags.TypeAlias) {
        const declNode = sym.declarations?.[0];
        types.push({
          id: `type.${name}`,
          name,
          kind: "type",
          artifactKind: "type",
          gitSha,
          generatedAt,
          sourcePath,
          package: npmName,
          typeText: declNode
            ? checker.typeToString(
                checker.getTypeAtLocation(declNode, declNode),
              )
            : undefined,
          jsDoc: declNode ? getJsDoc(checker, declNode) : undefined,
        });
        continue;
      }
      if (sym.flags & ts.SymbolFlags.Enum) {
        const declNode = sym.declarations?.[0];
        types.push({
          id: `type.${name}`,
          name,
          kind: "enum",
          artifactKind: "type",
          gitSha,
          generatedAt,
          sourcePath,
          package: npmName,
          jsDoc: declNode ? getJsDoc(checker, declNode) : undefined,
        });
        continue;
      }

      if (callSigs.length && !name.startsWith("use")) {
        const sig = callSigs[0]!;
        // React components are callables too; omit them here so `component.*` wins the bare symbol index.
        if (shouldExcludeCallableFromFunctionArtifacts(checker, sig)) {
          continue;
        }
        const node = sig.getDeclaration();
        try {
          functions.push({
            id: `function.${name}`,
            name,
            artifactKind: "function",
            gitSha,
            generatedAt,
            sourcePath,
            package: npmName,
            resolutionLevel: "full",
            params: describeParameters(checker, sig),
            returns: describeReturn(checker, sig),
            jsDoc: node ? getJsDoc(checker, node) : undefined,
          });
        } catch {
          functions.push({
            id: `function.${name}`,
            name,
            artifactKind: "function",
            gitSha,
            generatedAt,
            sourcePath,
            package: npmName,
            resolutionLevel: "partial",
            degradedReason: "UNSUPPORTED_TYPE",
            params: [],
            returns: { type: "unknown" },
          });
        }
      }
    }
  }

  return { hooks, types, functions };
}

export function extractFromPackage(
  target: PackageTarget,
  gitSha: string,
  generatedAt: string,
) {
  const { program, packageAbs } = createPackageProgram(target);
  const checker = program.getTypeChecker();
  return extractSymbolsFromProgram(
    program,
    checker,
    packageAbs,
    target.name,
    gitSha,
    generatedAt,
  );
}
