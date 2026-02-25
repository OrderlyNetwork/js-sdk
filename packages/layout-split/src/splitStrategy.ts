import type {
  LayoutStrategy,
  LayoutCapabilities,
} from "@orderly.network/layout-core";
import { SplitRenderer } from "./SplitRenderer";
import type { SplitLayoutModel } from "./types";
import {
  createDefaultSplitLayout,
  serializeSplitLayout,
  deserializeSplitLayout,
} from "./utils/splitLayoutUtils";

/**
 * Capabilities of the split layout strategy
 */
const splitCapabilities: LayoutCapabilities = {
  resize: true,
  drag: false,
  dock: false,
  tabs: false,
  constraints: "split",
  collapsible: false,
  nested: true,
};

/**
 * Split layout strategy implementation
 * Provides split-pane layout with resizable panels
 */
export const splitStrategy: LayoutStrategy<SplitLayoutModel> = {
  id: "split",
  displayName: "Split Layout",
  capabilities: splitCapabilities,
  defaultLayout: createDefaultSplitLayout,
  serialize: serializeSplitLayout,
  deserialize: deserializeSplitLayout,
  Renderer: SplitRenderer,
};
