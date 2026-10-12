import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { PredictionDataTable } from "@orderly.network/prediction/src/prediction/dataPanels/table/predictionDataTable.ui";

const mocks = vi.hoisted(() => ({ table: vi.fn() }));
vi.mock("@orderly.network/ui", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
  TableFeatures: { DownloadFeature: "download" },
  usePagination: () => ({
    pagination: { pageIndex: 0, pageSize: 20 },
    setPage: vi.fn(),
  }),
}));
vi.mock("@orderly.network/ui-connector", () => ({
  AuthGuardDataTable: (props: any) => {
    mocks.table(props);
    return null;
  },
}));
let root: ReactTestRenderer;
afterEach(() => act(() => root?.unmount()));
it("creates only nonempty account groups with distinct cross-account rows", () => {
  const groups = [
    { id: "main", label: "Main" },
    { id: "sub", label: "Child" },
    { id: "empty", label: "Empty" },
  ];
  const rows = ["main", "sub"].map((groupId) => ({
    id: `${groupId}:same-symbol:up`,
    groupId,
    cells: ["same-symbol", 10],
  }));
  act(() => {
    root = create(
      <PredictionDataTable
        groups={groups}
        rows={rows}
        columns={[
          { title: "Symbol", width: 250 },
          { title: "Size", width: 100 },
        ]}
      />,
    );
  });
  const props = mocks.table.mock.lastCall![0];
  expect(props.dataSource.map((row: any) => row.id)).toEqual(["main", "sub"]);
  expect(props.getSubRows(props.dataSource[0])[0].id).toBe(
    "main:same-symbol:up",
  );
  expect(props.getSubRows(props.dataSource[1])[0].id).toBe(
    "sub:same-symbol:up",
  );
  expect(props.onCell({ id: "cell_0" }, props.dataSource[0]).children).toBe(
    "Main",
  );
  expect(
    props.onCell({ id: "cell_1" }, props.dataSource[0]).children,
  ).toBeNull();
  expect(props.pagination.count).toBe(2);
});
it("ungrouped consumers keep their original rows and pagination", () => {
  act(() => {
    root = create(
      <PredictionDataTable
        rows={[{ id: "row", cells: ["symbol"] }]}
        columns={[{ title: "Symbol", width: 250 }]}
      />,
    );
  });
  const props = mocks.table.mock.lastCall![0];
  expect(props.dataSource[0].id).toBe("row");
  expect(props.getSubRows).toBeUndefined();
  expect(props.pagination.count).toBe(1);
});
