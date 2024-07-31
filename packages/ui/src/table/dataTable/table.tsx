import {
  Children,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Column, SortOrder } from "./col";
import { TableHeader } from "./thead";

import { ColGroup } from "./colgroup";
import { TableProvider } from "./tableContext";
// import { useDebouncedCallback } from "@orderly.network/hooks";
import { FixedDivide } from "./fixedDivide";
import { TBody, TBodyProps } from "./tbody";
// import { EndReachedBox } from "@/listView/endReachedBox";
import { Table } from "../table";
import { cnBase, type VariantProps } from "tailwind-variants";
import { tv } from "../../utils/tv";
import { TablePlaceholder } from "./tablePlaceholder";
import { useTableSize } from "./useTableSize";
import { Box } from "../../box";
import { cn } from "../..";

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
  // headerClassName?: string;
  // bodyClassName?: string;
  classNames?: {
    root?: string;
    header?: string;
    body?: string;
    footer?: string;
  };
  showMaskElement?: boolean;
  emptyView?: ReactNode;
  bordered?: boolean;
  loadMore?: () => void;
  onSort?: (options?: { sortKey: string; sort: SortOrder }) => void;
  initialSort?: { sortKey: string; sort: SortOrder };
  // onFilter?: (filter: DataTableFilter) => void;
  id?: string;
  // header?: ReactElement;
  // footer?: ReactElement;

  /**
   * if you want to fixed the table header or column, you need to set the height/width of the table;
   */
  scroll?: {
    /**
     * the width of the table
     */
    x?: number;
    y?: number;
  };
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

// const TableElement = () => {};

export const DataTable = <RecordType extends unknown>(
  props: PropsWithChildren<DataTableProps<RecordType>>
) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const {
    dataSource,
    loading,
    columns,
    showMaskElement = true,
    className,
    classNames,
    scroll,
    emptyView,
    ...rest
  } = props;
  const { root } = dataTableVariants({
    loading,
  });

  const [filterEle, setFilterEle] = useState<ReactElement | null>(null);
  const [paginationEle, setPaginationEle] = useState<ReactElement | null>(null);

  // const needFixed = useMemo(() => {
  //   return props.columns.some(
  //     (col) => col.fixed === "left" || col.fixed === "right"
  //   );
  // }, [props.columns]);
  //
  useLayoutEffect(() => {
    const children = props.children;

    Children.forEach(children, (child) => {
      // console.log("check filter element", child);
      if (isValidElement(child)) {
        // @ts-ignore
        if (child.type?.displayName === "DataFilter") {
          setFilterEle(child);
        }

        // @ts-ignore
        if (child.type?.displayName === "TablePagination") {
          setPaginationEle(child);
        }
      }
    });
  }, [props.children]);

  useEffect(() => {
    if (!wrapRef.current) return;
    const bodyBgColor = window.getComputedStyle(
      wrapRef.current
    ).backgroundColor;

    // body.style.setProperty("--table-header-height", "48px");
    wrapRef.current.style.setProperty("--table-background-color", bodyBgColor);
  }, []);

  const { width, height } = useTableSize({ scroll });

  let childElement = (
    <div
      id={props.id}
      ref={wrapRef}
      className={root({
        className: cnBase(
          "oui-table-root oui-bg-base-9",
          className,
          classNames?.root
        ),
      })}
      style={{ width, height }}
      // onScroll={(e) => onScroll(e.currentTarget.scrollLeft)}
    >
      <TableHeader
        columns={props.columns}
        className={classNames?.header}
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

      <div
        className={cn(
          "oui-relative oui-w-full oui-h-[calc(100%_-_40px)] oui-TableRoot oui-min-h-[280px]",
          classNames?.body
        )}
      >
        <Table className={cnBase("oui-table-fixed oui-border-collapse")}>
          <ColGroup columns={props.columns} />
          <TBody {...rest} />
        </Table>
        <TablePlaceholder
          visible={dataSource?.length === 0 || loading}
          loading={loading}
          emptyView={emptyView}
        />
        <FixedDivide />
      </div>

      {/* {props.children} */}
      {/* </EndReachedBox> */}
      {/* {showMaskElement && maskElement} */}
    </div>
  );

  if (filterEle || paginationEle) {
    childElement = (
      <>
        {filterEle}
        <Box px={3}>{childElement}</Box>
        {paginationEle}
      </>
    );
  }

  return (
    <TableProvider
      columns={props.columns}
      dataSource={props.dataSource}
      canExpand={typeof props.expandRowRender === "function"}
      onSort={props.onSort}
      initialSort={props.initialSort}
    >
      {childElement}
    </TableProvider>
  );
};
