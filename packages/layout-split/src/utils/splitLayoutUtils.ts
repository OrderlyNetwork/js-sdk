import {
  SPLIT_BREAKPOINT_ORDER,
  DEFAULT_SPLIT_BREAKPOINTS,
} from "../constants";
import type {
  SplitLayoutNode,
  SplitLayoutModel,
  SplitLayoutRule,
  SplitLayoutRuleNode,
  SplitLayoutBreakpointKey,
} from "../types";

/**
 * Converts a rule tree node to runtime SplitLayoutNode (orientation preserved, id→panelId).
 * Supports both `id` and `panelId` on panel rule nodes.
 */
export function normalizeRuleNodeToRuntime(
  ruleNode: SplitLayoutRuleNode,
): SplitLayoutNode {
  if (ruleNode.type === "panel") {
    const { id, ...rest } = ruleNode as SplitLayoutRuleNode & {
      panelId?: string;
    };
    return { ...rest, panelId: id ?? rest.panelId ?? "" };
  }
  if (ruleNode.type === "sort") {
    const children = ruleNode.children.map((child) =>
      normalizeRuleNodeToRuntime(child),
    );
    return {
      type: "sort",
      orientation: ruleNode.orientation,
      children,
    };
  }
  /* type === "split" */
  const children = ruleNode.children.map((child) => {
    const runtime = normalizeRuleNodeToRuntime(child);
    const size = runtime.size ?? (child as { size?: string }).size;
    const minSize = runtime.minSize ?? (child as { minSize?: string }).minSize;
    const maxSize = runtime.maxSize ?? (child as { maxSize?: string }).maxSize;
    const disabled =
      runtime.disabled ?? (child as { disabled?: boolean }).disabled;
    return {
      ...runtime,
      ...(size !== undefined && { size }),
      ...(minSize !== undefined && { minSize }),
      ...(maxSize !== undefined && { maxSize }),
      ...(disabled !== undefined && { disabled }),
    };
  });
  return {
    type: "split",
    orientation: ruleNode.orientation,
    children,
  };
}

/**
 * Returns a stable sortable id for a child node (panel uses panelId, others use path).
 */
export function getSortableIdForChild(
  child: SplitLayoutNode,
  path: number[],
  index: number,
): string {
  if (child.type === "panel") return child.panelId;
  return `sortable-${path.join("-")}-${index}`;
}

/**
 * Reorders children at the given path and returns the updated root.
 * Used when user drags to reorder within a sort container.
 */
export function updateOrderAtPath(
  node: SplitLayoutNode,
  path: number[],
  newOrder: SplitLayoutNode[],
): SplitLayoutNode {
  if (node.type === "panel") return node;
  if (path.length === 0) {
    return { ...node, children: newOrder };
  }
  const [childIndex, ...restPath] = path;
  const updatedChildren = [...node.children];
  if (childIndex < updatedChildren.length) {
    updatedChildren[childIndex] = updateOrderAtPath(
      updatedChildren[childIndex],
      restPath,
      newOrder,
    );
  }
  return { ...node, children: updatedChildren };
}

/**
 * Builds runtime SplitLayoutNode for one breakpoint from a rule.
 * Falls back to lg when the breakpoint has no rule tree.
 */
export function buildSplitLayoutFromRule(
  rule: SplitLayoutRule,
  breakpointKey: SplitLayoutBreakpointKey,
): SplitLayoutNode {
  const tree = rule[breakpointKey] ?? rule.lg;
  if (!tree) {
    throw new Error(
      `Split layout rule must define at least 'lg'; missing for ${breakpointKey}`,
    );
  }
  return normalizeRuleNodeToRuntime(tree);
}

/**
 * Builds full responsive SplitLayoutModel from a rule (all breakpoints).
 * Missing rule entries for a breakpoint use the lg tree.
 */
export function createDefaultSplitLayoutFromRule(
  rule: SplitLayoutRule,
): SplitLayoutModel {
  const layouts = {} as SplitLayoutModel["layouts"];
  for (const bp of SPLIT_BREAKPOINT_ORDER) {
    layouts[bp] = buildSplitLayoutFromRule(rule, bp);
  }
  return {
    layouts,
    breakpoints: DEFAULT_SPLIT_BREAKPOINTS,
  };
}

/**
 * Creates default split layout for given panel IDs (strategy.defaultLayout).
 * Same simple horizontal tree for all breakpoints.
 *
 * @param panelIds - Panel IDs to include
 * @returns Split layout model with layouts and breakpoints
 */
export function createDefaultSplitLayout(panelIds: string[]): SplitLayoutModel {
  if (panelIds.length === 0) {
    throw new Error(
      "Cannot create default split layout: no panel IDs provided",
    );
  }

  let singleRoot: SplitLayoutNode;
  if (panelIds.length === 1) {
    singleRoot = { type: "panel", panelId: panelIds[0] };
  } else {
    singleRoot = {
      type: "split",
      orientation: "horizontal",
      children: panelIds.map((id) => ({ type: "panel" as const, panelId: id })),
    };
  }

  const layouts = {
    lg: singleRoot,
    md: singleRoot,
    sm: singleRoot,
    xs: singleRoot,
    xxs: singleRoot,
  };

  return {
    layouts,
    breakpoints: DEFAULT_SPLIT_BREAKPOINTS,
  };
}

/**
 * Parses a size string to a percentage (1–100) for react-resizable-panels defaultSize.
 * - "40%" → 40
 * - "auto" or missing → equal share (100 / total)
 *
 * @param size - Size string from layout node (e.g. "40%", "auto")
 * @param total - Total number of panels (for equal share)
 * @returns Percentage 1–100
 */
export function parseSizeToPercent(
  size: string | undefined,
  total: number,
): number {
  if (total <= 0) return 100;
  const equalShare = 100 / total;
  if (size === undefined || size === "auto" || size.trim() === "") {
    return Math.max(1, Math.round(equalShare));
  }
  const match = size.trim().match(/^(\d+(?:\.\d+)?)\s*%?$/);
  if (match) {
    const n = Number(match[1]);
    return Math.max(1, Math.min(100, Math.round(n)));
  }
  return Math.max(1, Math.round(equalShare));
}

/** Checks that value is a valid orientation. */
function isValidOrientation(v: unknown): v is "horizontal" | "vertical" {
  return v === "horizontal" || v === "vertical";
}

/** Validates a container node (split or sort): orientation + children array. */
function validateContainerNode(n: Record<string, unknown>): boolean {
  if (!isValidOrientation(n.orientation)) return false;
  if (!Array.isArray(n.children)) return false;
  return (n.children as unknown[]).every((c) => validateSplitLayoutNode(c));
}

/**
 * Validates a runtime split layout node recursively.
 */
function validateSplitLayoutNode(node: unknown): node is SplitLayoutNode {
  if (!node || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;

  if (n.type === "panel") {
    return (
      typeof n.panelId === "string" &&
      n.panelId.length > 0 &&
      (n.size === undefined || typeof n.size === "string") &&
      (n.minSize === undefined || typeof n.minSize === "string") &&
      (n.maxSize === undefined || typeof n.maxSize === "string") &&
      (n.disabled === undefined || typeof n.disabled === "boolean") &&
      (n.className === undefined || typeof n.className === "string") &&
      (n.style === undefined || typeof n.style === "object")
    );
  }
  if (n.type === "split" || n.type === "sort") return validateContainerNode(n);
  return false;
}

/**
 * Validates that an object has required layouts and breakpoints for the model shape.
 */
function validateSplitLayoutModel(parsed: unknown): parsed is SplitLayoutModel {
  if (!parsed || typeof parsed !== "object") return false;
  const p = parsed as Record<string, unknown>;
  const layoutsSource = p.layouts ?? p.roots;
  if (!layoutsSource || typeof layoutsSource !== "object") return false;
  if (!p.breakpoints || typeof p.breakpoints !== "object") return false;
  const layouts = layoutsSource as Record<string, unknown>;
  for (const bp of SPLIT_BREAKPOINT_ORDER) {
    if (!validateSplitLayoutNode(layouts[bp])) return false;
  }
  const bp = p.breakpoints as Record<string, unknown>;
  for (const k of SPLIT_BREAKPOINT_ORDER) {
    if (typeof bp[k] !== "number") return false;
  }
  return true;
}

/**
 * Serializes split layout model to JSON (layouts + breakpoints only).
 */
export function serializeSplitLayout(layout: SplitLayoutModel): string {
  return JSON.stringify(layout);
}

/**
 * Deserializes JSON to split layout model; validates layouts and breakpoints.
 */
export function deserializeSplitLayout(json: string): SplitLayoutModel {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!validateSplitLayoutModel(parsed)) {
      throw new Error(
        "Invalid split layout: must have layouts (lg,md,sm,xs,xxs) and breakpoints",
      );
    }
    const layout = parsed as SplitLayoutModel & {
      roots?: SplitLayoutModel["layouts"];
    };
    const layoutsSource = layout.layouts ?? layout.roots;
    const layouts = {} as SplitLayoutModel["layouts"];
    for (const bp of SPLIT_BREAKPOINT_ORDER) {
      layouts[bp] = layoutsSource[bp];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit roots when returning layouts
    const { roots: _roots, ...rest } = layout;
    return { ...rest, layouts };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to deserialize split layout: ${error.message}`);
    }
    throw new Error(`Failed to deserialize split layout: ${error}`);
  }
}
