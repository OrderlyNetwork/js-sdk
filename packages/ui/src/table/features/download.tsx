import React, { ReactNode } from "react";
import { Table, TableFeature, RowData } from "@tanstack/react-table";
import { getPlainTextByCell, TableCell } from "../tableCell";
import { Column } from "../type";

// Define types for our new feature's table APIs
export interface DownloadInstance {
  getPlainTextData: () => any[];
  download: (filename?: string) => void;
}

// Use declaration merging to add our new feature APIs and state types to TanStack Table's existing types.
declare module "@tanstack/react-table" {
  //merge our new feature's instance APIs with the existing table instance APIs
  interface Table<TData extends RowData> extends DownloadInstance {}
}

export const DownloadFeature: TableFeature<any> = {
  // define the new feature's table instance methods
  createTable: <TData extends RowData>(table: Table<TData>): void => {
    table.getPlainTextData = () => {
      const header = table
        .getAllColumns()
        .map((column) => jsxToPlainText((column.columnDef.meta as any).title));
      // console.log("header", table.getAllColumns(), header);

      const rows = table.getRowModel().rows.map((row) =>
        row.getVisibleCells().map((cell) => {
          const { original: record, index } = cell.row;
          const { formatter, render, rule, textProps, numeralProps } = (cell
            .column.columnDef.meta || {}) as Column;

          return cell.getValue();

          const CellElement = getPlainTextByCell(cell);
          const value = jsxToPlainText(CellElement);
          // console.log(
          //   "value",
          //   <TableCell cell={cell} />,
          //   value,
          //   cell.getValue()
          // );
          return value;
        })
      );

      const data = [header, ...rows];

      return data;
    };

    table.download = (filename?: string) => {
      const data = table.getPlainTextData();
      downloadCSV(data, filename);
    };
  },
};

function generateCSV(data: any[]) {
  return data.map((row) => row.join(",")).join("\n");
}

function downloadCSV(data: any[], filename = `${Date.now()}.csv`) {
  const csvContent = generateCSV(data);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.click();

  URL.revokeObjectURL(url);
}

export function jsxToPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return node.toString(); // 如果是字符串或数字，直接返回
  }

  if (React.isValidElement(node)) {
    // 如果是有效的 React 元素，递归提取其子节点文本
    return jsxToPlainText(node.props.cell || node.props.children);
  }

  if (Array.isArray(node)) {
    // 如果是数组，递归处理每个子节点
    return node.map(jsxToPlainText).join("");
  }

  return ""; // 其他情况返回空字符串，例如 null、undefined、布尔值
}
