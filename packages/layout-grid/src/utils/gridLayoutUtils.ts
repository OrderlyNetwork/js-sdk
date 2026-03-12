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

export const DEFAULT_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

export const DEFAULT_COLS = {
  lg: 24,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

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
      className: spec.className,
      style: spec.style,
    }));
}

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

/** Build grid layout from panelIds; optional rule (missing breakpoints fall back to lg), else 2-column default. */
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

export function serializeGridLayout(layout: GridLayoutModel): string {
  return JSON.stringify(layout);
}

export function deserializeGridLayout(json: string): GridLayoutModel {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.layouts) {
      throw new Error("Invalid grid layout: missing layouts");
    }
    return parsed as GridLayoutModel;
  } catch (error) {
    throw new Error(`Failed to deserialize grid layout: ${error}`);
  }
}
