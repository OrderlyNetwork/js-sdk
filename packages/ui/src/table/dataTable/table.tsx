import {
  FC,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Column } from "./col";
import { TableHeader } from "./thead";

import { Spinner } from "../../spinner";
import { ColGroup } from "./colgroup";
import { TableProvider } from "./tableContext";
// import { useDebouncedCallback } from "@orderly.network/hooks";
import { FixedDivide } from "./fixedDivide";
import { TBody, TBodyProps } from "./tbody";
// import { EndReachedBox } from "@/listView/endReachedBox";
import { Table } from "../table";
import { type VariantProps } from "tailwind-variants";
import { tv } from "../../utils/tv";
import { TablePlaceholder } from "./tablePlaceholder";

export interface DataTableProps<RecordType>
  extends TBodyProps<RecordType>,
    VariantProps<typeof dataTableVariants> {
  columns: Column<RecordType>[];
  dataSource?: RecordType[] | null;
  /**
   * @description loading state
   * @default false
   */
  loading?: boolean;
  className?: string;
  headerClassName?: string;
  showMaskElement?: boolean;
  bordered?: boolean;
  loadMore?: () => void;
  // onFilter?: (filter: DataTableFilter) => void;
  id?: string;
  header?: ReactElement;
  footer?: ReactElement;
}

const dataTableVariants = tv({
  slots: {
    root: "oui-DataTableRoot oui-relative oui-flex-col oui-overflow-x-auto oui-peer",
  },
  variants: {
    loading: {
      true: {
        root: "oui-overflow-hidden",
      },
      false: {
        root: "",
      },
    },
  },
});

export const DataTable = <RecordType extends unknown>(
  props: PropsWithChildren<DataTableProps<RecordType>>
) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const {
    dataSource,
    loading,
    columns,
    showMaskElement = true,
    ...rest
  } = props;
  const { root } = dataTableVariants({
    loading,
  });

  const needFixed = useMemo(() => {
    return props.columns.some(
      (col) => col.fixed === "left" || col.fixed === "right"
    );
  }, [props.columns]);

  useEffect(() => {
    if (!wrapRef.current) return;
    const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;

    // body.style.setProperty("--table-header-height", "48px");
    wrapRef.current.style.setProperty("--table-background-color", bodyBgColor);
  }, []);

  return (
    <TableProvider
      columns={props.columns}
      dataSource={props.dataSource}
      canExpand={typeof props.expandRowRender === "function"}
    >
      <div
        id={props.id}
        ref={wrapRef}
        className={root()}
        style={{ height: "calc(100% - 2px)" }}
        // onScroll={(e) => onScroll(e.currentTarget.scrollLeft)}
      >
        <TableHeader
          columns={props.columns}
          className={props.headerClassName}
          bordered={props.bordered}
          justified={props.justified}
        />
        {/* <EndReachedBox
          onEndReached={() => {
            // if (!props.loading) {
            props.loadMore?.();
            // }
          }}
        > */}
        <div className="oui-relative oui-w-full oui-overflow-auto oui-TableRoot oui-min-h-[280px]">
          <Table className="oui-table-fixed oui-border-collapse">
            <ColGroup columns={props.columns} />
            <TBody {...rest} />
          </Table>
          <TablePlaceholder
            visible={dataSource?.length === 0 || loading}
            loading={loading}
          />
        </div>

        {/* </EndReachedBox> */}
        {/* {showMaskElement && maskElement} */}
        {props.children}
      </div>

      <FixedDivide />
    </TableProvider>
  );
};
