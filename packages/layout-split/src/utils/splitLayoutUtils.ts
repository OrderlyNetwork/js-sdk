import type { SplitLayoutNode, SplitLayoutModel } from "../types";

/**
 * Create a default split layout for given panel IDs
 * Creates a simple horizontal split with all panels
 *
 * @param panelIds - Array of panel IDs to include
 * @returns Default split layout model
 * @throws Error if panelIds is empty (no valid layout can be created)
 */
export function createDefaultSplitLayout(panelIds: string[]): SplitLayoutModel {
  if (panelIds.length === 0) {
    // Return a minimal empty layout structure instead of invalid panel with empty ID
    // This allows LayoutHost to handle empty state gracefully
    throw new Error(
      "Cannot create default split layout: no panel IDs provided",
    );
  }

  if (panelIds.length === 1) {
    return {
      root: {
        type: "panel",
        panelId: panelIds[0],
      },
    };
  }

  // For multiple panels, create a horizontal split
  const children: SplitLayoutNode[] = panelIds.map((id) => ({
    type: "panel",
    panelId: id,
  }));

  return {
    root: {
      type: "split",
      mode: "horizontal",
      children,
    },
  };
}

/**
 * Serialize split layout model to JSON string
 *
 * @param layout - Split layout model
 * @returns JSON string
 */
export function serializeSplitLayout(layout: SplitLayoutModel): string {
  return JSON.stringify(layout);
}

/**
 * Validate that a node structure is valid
 */
function validateSplitLayoutNode(node: unknown): node is SplitLayoutNode {
  if (!node || typeof node !== "object") {
    return false;
  }

  const n = node as Record<string, unknown>;

  if (n.type === "panel") {
    return (
      typeof n.panelId === "string" &&
      n.panelId.length > 0 &&
      (n.size === undefined || typeof n.size === "string")
    );
  }

  if (n.type === "split") {
    if (n.mode !== "horizontal" && n.mode !== "vertical") {
      return false;
    }
    if (!Array.isArray(n.children)) {
      return false;
    }
    // Recursively validate children
    if (!n.children.every((child: unknown) => validateSplitLayoutNode(child))) {
      return false;
    }
    // Validate sizes array if present
    if (n.sizes !== undefined) {
      if (
        !Array.isArray(n.sizes) ||
        n.sizes.length !== n.children.length ||
        !n.sizes.every((s: unknown) => typeof s === "string")
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Deserialize JSON string to split layout model
 *
 * @param json - JSON string
 * @returns Split layout model
 * @throws Error if JSON is invalid or layout structure is invalid
 */
export function deserializeSplitLayout(json: string): SplitLayoutModel {
  try {
    const parsed = JSON.parse(json);
    // Validate root exists
    if (!parsed.root) {
      throw new Error("Invalid split layout: missing root node");
    }
    // Validate root structure recursively
    if (!validateSplitLayoutNode(parsed.root)) {
      throw new Error("Invalid split layout: root node structure is invalid");
    }
    return parsed as SplitLayoutModel;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to deserialize split layout: ${error.message}`);
    }
    throw new Error(`Failed to deserialize split layout: ${error}`);
  }
}
