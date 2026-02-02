import type { GridLayoutModel, GridLayoutItem } from "../types";

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
 * Create a default grid layout for given panel IDs
 * Arranges panels in a simple grid pattern
 *
 * @param panelIds - Array of panel IDs to include
 * @returns Default grid layout model
 */
export function createDefaultGridLayout(panelIds: string[]): GridLayoutModel {
  const items: GridLayoutItem[] = panelIds.map((panelId, index) => ({
    i: panelId,
    panelId,
    x: (index % 2) * 6, // 2 columns
    y: Math.floor(index / 2),
    w: 6,
    h: 4,
    minW: 3,
    minH: 2,
  }));

  return {
    layouts: {
      lg: items,
      md: items,
      sm: items.map((item) => ({ ...item, x: 0, w: 6 })),
      xs: items.map((item) => ({ ...item, x: 0, w: 4 })),
      xxs: items.map((item) => ({ ...item, x: 0, w: 2 })),
    },
    breakpoints: DEFAULT_BREAKPOINTS,
    cols: DEFAULT_COLS,
    compactType: "vertical",
    isDraggable: true,
    isResizable: true,
    margin: [8, 8],
    containerPadding: [0, 0],
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
