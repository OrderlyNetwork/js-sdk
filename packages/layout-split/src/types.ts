import type { LayoutModel } from "@orderly.network/layout-core";

/**
 * Split layout node type
 * Represents a single panel or a split container
 */
export type SplitLayoutNode =
  | {
      /** Node type: 'panel' means it contains a panel ID */
      type: "panel";
      /** Panel ID to render */
      panelId: string;
      /** Size of this panel (percentage or pixel value) */
      size?: string;
    }
  | {
      /** Node type: 'split' means it contains child nodes */
      type: "split";
      /** Split direction */
      mode: "horizontal" | "vertical";
      /** Child nodes */
      children: SplitLayoutNode[];
      /** Sizes for each child (optional, will be auto-calculated if not provided) */
      sizes?: string[];
    };

/**
 * Split layout model
 * Root node of the split tree
 */
export interface SplitLayoutModel extends LayoutModel {
  /** Root node of the split tree */
  root: SplitLayoutNode;
}
