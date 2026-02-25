import type {
  LayoutStrategy,
  LayoutCapabilities,
} from "@orderly.network/layout-core";
import { GridRenderer } from "./GridRenderer";
import type { GridLayoutModel } from "./types";
import {
  createDefaultGridLayout,
  serializeGridLayout,
  deserializeGridLayout,
} from "./utils/gridLayoutUtils";

/**
 * Capabilities of the grid layout strategy
 */
const gridCapabilities: LayoutCapabilities = {
  resize: true,
  drag: true,
  dock: false,
  tabs: false,
  constraints: "grid",
  collapsible: false,
  nested: false,
};

/**
 * Grid layout strategy implementation
 * Provides responsive grid layout with draggable and resizable panels
 */
export const gridStrategy: LayoutStrategy<GridLayoutModel> = {
  id: "grid",
  displayName: "Grid Layout",
  capabilities: gridCapabilities,
  defaultLayout: createDefaultGridLayout,
  serialize: serializeGridLayout,
  deserialize: deserializeGridLayout,
  Renderer: GridRenderer,
};
