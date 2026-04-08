import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { AI_DOCS_ROOT, relFromRepo } from "./paths.js";

export type ChunkRecord = {
  id: string;
  path: string;
  heading: string;
  startLine: number;
  endLine: number;
  kind?: string;
  packages?: string[];
  text: string;
};

/**
 * Build chunk index from Markdown under apps/ai-docs (excluding generated), §3.4.
 */
export async function buildChunkIndex(): Promise<Record<string, ChunkRecord>> {
  const patterns = [
    "*.md",
    "workflows/*.md",
    "recipes/*.md",
    "components/*.md",
    "types/*.md",
  ];
  const files = await fg(patterns, {
    cwd: AI_DOCS_ROOT,
    onlyFiles: true,
    ignore: ["generated/**", "node_modules/**"],
  });

  const chunks: Record<string, ChunkRecord> = {};
  let auto = 0;

  for (const rel of files) {
    const abs = path.join(AI_DOCS_ROOT, rel);
    const raw = fs.readFileSync(abs, "utf8");
    const lines = raw.split(/\r?\n/);

    let fmKind: string | undefined;
    let fmId: string | undefined;
    let fmPkgs: string[] | undefined;
    if (raw.startsWith("---")) {
      const end = raw.indexOf("\n---", 3);
      if (end !== -1) {
        const fm = raw.slice(3, end);
        for (const line of fm.split("\n")) {
          const m = line.match(/^kind:\s*(.+)/);
          if (m) fmKind = m[1]!.trim();
          const idm = line.match(/^id:\s*(.+)/);
          if (idm) fmId = idm[1]!.trim();
          const pk = line.match(/^packages:\s*\[(.*)\]/);
          if (pk) {
            fmPkgs = pk[1]!
              .split(",")
              .map((s) => s.trim().replace(/^["']|["']$/g, ""))
              .filter(Boolean);
          }
        }
      }
    }

    const sectionStarts: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^#{1,3}\s+/.test(lines[i]!)) sectionStarts.push(i);
    }
    if (!sectionStarts.length) {
      const id = fmId ?? `md.${rel.replace(/[^\w]+/g, "_")}.${auto++}`;
      chunks[id] = {
        id,
        path: relFromRepo(abs),
        heading: rel,
        startLine: 1,
        endLine: lines.length,
        kind: fmKind,
        packages: fmPkgs,
        text: raw,
      };
      continue;
    }

    for (let s = 0; s < sectionStarts.length; s++) {
      const start = sectionStarts[s]!;
      const end = s + 1 < sectionStarts.length ? sectionStarts[s + 1]! - 1 : lines.length - 1;
      const headingLine = lines[start]!.replace(/^#+\s+/, "").trim();
      const id =
        fmId && s === 0
          ? fmId
          : `md.${rel.replace(/[^\w/]+/g, "_")}.${headingLine.replace(/[^\w]+/g, "_")}.${auto++}`;
      const text = lines.slice(start, end + 1).join("\n");
      chunks[id] = {
        id,
        path: relFromRepo(abs),
        heading: headingLine,
        startLine: start + 1,
        endLine: end + 1,
        kind: fmKind,
        packages: fmPkgs,
        text,
      };
    }
  }

  return chunks;
}
