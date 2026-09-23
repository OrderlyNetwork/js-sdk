import type React from "react";

export type PredictionTableRow = {
  id: string;
  cells: React.ReactNode[];
  sortValues?: Array<string | number | undefined>;
  [key: string]: React.ReactNode | React.ReactNode[];
};

export type PredictionTableColumn = {
  title: React.ReactNode;
  width: number;
  align?: "left" | "center" | "right";
  fixed?: "start" | "end";
  sortable?: boolean;
  type?: "data" | "action";
};

export const tableColumn = (
  title: React.ReactNode,
  width: number,
  options?: Omit<PredictionTableColumn, "title" | "width">,
): PredictionTableColumn => ({ title, width, ...options });
