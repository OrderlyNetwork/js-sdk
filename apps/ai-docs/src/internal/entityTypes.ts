/**
 * Shared entity shapes written to `generated/json/**` (tech §8.4 provenance).
 */
export type ArtifactKind = "hook" | "type" | "function" | "component";

export type ResolutionLevel = "full" | "partial" | "syntax-only";

export type DegradedReason = "OOM" | "TIMEOUT" | "UNSUPPORTED_TYPE";

export type Provenance = {
  artifactKind: ArtifactKind;
  gitSha: string;
  generatedAt: string;
  sourcePath: string;
  package: string;
  resolutionLevel?: ResolutionLevel;
  degradedReason?: DegradedReason;
};

export type HookEntity = Provenance & {
  id: string;
  name: string;
  signatureText?: string;
  params: Array<{
    name: string;
    type: string;
    optional?: boolean;
    description?: string;
  }>;
  returns?: { type: string; description?: string };
  jsDoc?: string;
};

export type TypeEntity = Provenance & {
  id: string;
  name: string;
  kind: "interface" | "type" | "enum" | "class";
  /** Serialized type text when available */
  typeText?: string;
  jsDoc?: string;
};

export type FunctionEntity = Provenance & {
  id: string;
  name: string;
  signatureText?: string;
  params: HookEntity["params"];
  returns?: { type: string; description?: string };
  jsDoc?: string;
};

export type ComponentEntity = Provenance & {
  id: string;
  name: string;
  displayName?: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: string | null;
    description?: string;
  }>;
  jsDoc?: string;
};
