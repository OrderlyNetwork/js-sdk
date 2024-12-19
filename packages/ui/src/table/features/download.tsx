import React, { ReactNode } from "react";
import { Table, TableFeature, RowData } from "@tanstack/react-table";
import { getPlainTextByCell, TableCell } from "../tableCell";
import { Column } from "../type";
import ReactDOMServer from "react-dom/server";

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
          const { renderPlantText } = (cell.column.columnDef.meta ||
            {}) as Column;

          const value = cell.getValue();

          // const html = ReactDOMServer.renderToString(<TableCell cell={cell} />);

          if (typeof renderPlantText === "function") {
            return renderPlantText(value, record, index);
          }

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
    return node.toString();
  }

  if (React.isValidElement(node)) {
    return jsxToPlainText(node.props.children || node.props.cell);
  }

  if (Array.isArray(node)) {
    return node.map(jsxToPlainText).join("");
  }

  return "--";
}
