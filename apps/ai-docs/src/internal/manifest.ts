import { z } from "zod";

export const ManifestSchema = z.object({
  schemaVersion: z.string(),
  gitSha: z.string(),
  generatedAt: z.string(),
  releaseVersion: z.string().nullable(),
  artifactKinds: z.array(z.string()),
  roots: z.object({
    markdownRoot: z.string(),
    generatedRoot: z.string(),
  }),
  indexPaths: z.object({
    idIndex: z.string(),
    symbolIndex: z.string(),
    packageIndex: z.string(),
    keywordIndex: z.string(),
    componentDocIndex: z.string().optional(),
    /** @deprecated removed — only present on old manifests */
    chunkIndex: z.string().optional(),
  }),
  qmd: z
    .object({
      collectionId: z.string().optional(),
      indexPath: z.string().optional(),
      docMetaIndexPath: z.string().optional(),
      embeddingModelId: z.string().nullable().optional(),
      lastIndexBuildAt: z.string().nullable().optional(),
    })
    .optional(),
  analysisStats: z.object({
    totalSymbols: z.number(),
    fullyResolved: z.number(),
    degradedCount: z.number(),
  }),
});

export type Manifest = z.infer<typeof ManifestSchema>;
