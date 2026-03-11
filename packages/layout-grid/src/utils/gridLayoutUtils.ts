import type {
  GridLayoutModel,
  GridLayoutItem,
  GridLayoutRule,
  GridLayoutItemSpec,
  GridLayoutBreakpointKey,
} from "../types";

const BREAKPOINT_ORDER: GridLayoutBreakpointKey[] = [
  "lg",
  "md",
  "sm",
  "xs",
  "xxs",
];

/**
 * Default breakpoints for responsive grid layout
 */
export const DEFAULT_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

/**
 * Default column counts for each breakpoint
 */
export const DEFAULT_COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

/**
 * Convert a breakpoint's GridLayoutItemSpec[] to GridLayoutItem[].
 * Only includes items whose panelId is in panelIds; sets i = panelId.
 */
function specsToItems(
  specs: GridLayoutItemSpec[],
  panelIds: string[],
): GridLayoutItem[] {
  const idSet = new Set(panelIds);
  return specs
    .filter((spec) => idSet.has(spec.panelId))
    .map((spec) => ({
      i: spec.panelId,
      panelId: spec.panelId,
      x: spec.x,
      y: spec.y,
      w: spec.w,
      h: spec.h,
      minW: spec.minW,
      minH: spec.minH,
      maxW: spec.maxW,
      maxH: spec.maxH,
      isDraggable: spec.isDraggable,
      isResizable: spec.isResizable,
      resizeHandles: spec.resizeHandles,
      static: spec.static,
    }));
}

/**
 * Build layouts from a rule: for each breakpoint use its specs or fall back to lg.
 */
function buildLayoutsFromRule(
  rule: GridLayoutRule,
  panelIds: string[],
): GridLayoutModel["layouts"] {
  const result: GridLayoutModel["layouts"] = {};
  const fallbackSpecs = rule.lg ?? [];
  for (const bp of BREAKPOINT_ORDER) {
    const specs = rule[bp] ?? fallbackSpecs;
    result[bp] = specsToItems(specs, panelIds);
  }
  return result;
}

/**
 * Default 2-column layout (used when no rule is provided).
 */
function defaultTwoColumnLayout(
  panelIds: string[],
): GridLayoutModel["layouts"] {
  const items: GridLayoutItem[] = panelIds.map((panelId, index) => ({
    i: panelId,
    panelId,
    x: (index % 2) * 6,
    y: Math.floor(index / 2),
    w: 6,
    h: 4,
    minW: 3,
    minH: 2,
  }));
  return {
    lg: items,
    md: items,
    sm: items.map((item) => ({ ...item, x: 0, w: 6 })),
    xs: items.map((item) => ({ ...item, x: 0, w: 4 })),
    xxs: items.map((item) => ({ ...item, x: 0, w: 2 })),
  };
}

/**
 * Create a grid layout for given panel IDs, optionally from a layout rule.
 * When rule is provided, layouts are built from rule (missing breakpoints fall back to lg).
 * When rule is omitted, uses built-in 2-column default for backward compatibility.
 *
 * @param panelIds - Panel IDs to include
 * @param rule - Optional layout rule (per-breakpoint specs)
 * @param rowHeight - Optional row height for finer grid adjustment
 * @returns Grid layout model
 */
export function createDefaultGridLayout(
  panelIds: string[],
  rule?: GridLayoutRule,
  rowHeight?: number,
): GridLayoutModel {
  const layouts =
    rule != null
      ? buildLayoutsFromRule(rule, panelIds)
      : defaultTwoColumnLayout(panelIds);

  return {
    layouts,
    breakpoints: DEFAULT_BREAKPOINTS,
    cols: DEFAULT_COLS,
    compactType: "vertical",
    isDraggable: true,
    isResizable: true,
    margin: [8, 8],
    containerPadding: [0, 0],
    rowHeight: rowHeight ?? 30,
  };
}

/**
 * Serialize grid layout model to JSON string
 *
 * @param layout - Grid layout model
 * @returns JSON string
 */
export function serializeGridLayout(layout: GridLayoutModel): string {
  return JSON.stringify(layout);
}

/**
 * Deserialize JSON string to grid layout model
 *
 * @param json - JSON string
 * @returns Grid layout model
 */
export function deserializeGridLayout(json: string): GridLayoutModel {
  try {
    const parsed = JSON.parse(json);
    // Basic validation
    if (!parsed.layouts) {
      throw new Error("Invalid grid layout: missing layouts");
    }
    return parsed as GridLayoutModel;
  } catch (error) {
    throw new Error(`Failed to deserialize grid layout: ${error}`);
  }
}
