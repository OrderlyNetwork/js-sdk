import type { LayoutStrategy } from "@orderly.network/layout-core";
import { GridRenderer } from "./GridRenderer";
import type { GridLayoutModel } from "./types";
import {
  createDefaultGridLayout,
  serializeGridLayout,
  deserializeGridLayout,
} from "./utils/gridLayoutUtils";

/**
 * Grid layout strategy implementation
 * Provides responsive grid layout with draggable and resizable panels
 */
export const gridStrategy: LayoutStrategy<GridLayoutModel> = {
  id: "grid",
  displayName: "Grid Layout",
  defaultLayout: createDefaultGridLayout,
  serialize: serializeGridLayout,
  deserialize: deserializeGridLayout,
  Renderer: GridRenderer,
};
