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
import { ScrollArea } from "../../scrollarea";

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

const DEFAULT_MIN_HEIGHT = 130;

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
  isValidating?: boolean;
  // checkLoading?: boolean;
  ignoreLoadingCheck?: boolean;
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
  // stickyHeader?: boolean;
  loadMore?: () => void;
  onSort?: (options?: { sortKey: string; sort: SortOrder }) => void;
  initialSort?: { sortKey: string; sort: SortOrder };
  // onFilter?: (filter: DataTableFilter) => void;
  id?: string;
  // header?: ReactElement;
  // footer?: ReactElement;

  minHeight?: number;
  initialMinHeight?: number;

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
    root: "oui-data-table-root oui-relative oui-flex-col  oui-peer",
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
  const tableRef = useRef<HTMLTableElement>(null);
  const {
    dataSource,
    loading,
    isValidating,
    columns,
    showMaskElement = true,
    className,
    classNames,
    scroll,
    emptyView,
    minHeight: minHeightProp,
    initialMinHeight,
    ignoreLoadingCheck,
    // stickyHeader,
    ...rest
  } = props;
  const { root } = dataTableVariants({
    loading,
  });

  // const fetched = useRef(0);
  //
  const [initialized, setInitialized] = useState(false);
  // const minHeight = useRef(initialMinHeight || DEFAULT_MIN_HEIGHT);

  useEffect(() => {
    if (initialized) return;

    if (
      ignoreLoadingCheck ||
      loading ||
      // isValidating ||
      Array.isArray(dataSource)
    ) {
      setInitialized(true);
    }
  }, [loading, ignoreLoadingCheck, dataSource, initialized]);

  const [filterEle, setFilterEle] = useState<ReactElement | null>(null);
  const [paginationEle, setPaginationEle] = useState<ReactElement | null>(null);

  // const needFixed = useMemo(() => {
  //   return props.columns.some(
  //     (col) => col.fixed === "left" || col.fixed === "right"
  //   );
  // }, [props.columns]);
  //

  const { width, height, minHeight, updateMinHeight } = useTableSize(tableRef, {
    scroll,
    minHeight: props.initialMinHeight,
  });

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
          setPaginationEle((prev) => {
            if (!!prev && child.props.pageSize !== prev.props.pageSize) {
              updateMinHeight(initialMinHeight || DEFAULT_MIN_HEIGHT);
            }
            return child;
          });

          // setPaginationEle(child);
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

  // if pageSize is changed or data is null, reset the minHeight
  // useEffect(() => {
  //   if (dataSource === null) {
  //     minHeight.current = initialMinHeight || DEFAULT_MIN_HEIGHT;
  //   }
  // }, [dataSource]);

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
      // style={{ width }}
      // onScroll={(e) => onScroll(e.currentTarget.scrollLeft)}
    >
      <TableHeader
        columns={props.columns}
        className={classNames?.header}
        bordered={props.bordered}
        justified={props.justified}
        sticky={false}
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
          "oui-relative oui-w-full oui-table-body",
          classNames?.body
        )}
        style={{
          minHeight: minHeightProp ? `${minHeightProp}px` : minHeight,
          height,
        }}
      >
        <ScrollView
          scroll={{
            width,
            height,
          }}
        >
          <Table
            className={cnBase("oui-table-fixed oui-border-collapse")}
            ref={tableRef}
          >
            <ColGroup columns={props.columns} />
            <TBody {...rest} />
          </Table>
        </ScrollView>

        <TablePlaceholder
          visible={((dataSource?.length ?? 0) === 0 || loading) && initialized}
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
        <Box>{childElement}</Box>
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

const ScrollView = (
  props: PropsWithChildren<{
    scroll: {
      width?: string | number;
      height?: string | number;
    };
  }>
) => {
  const { scroll } = props;

  // console.log("scroll", scroll, !scroll || (!scroll.width && !scroll.width));

  if (!scroll || (!scroll.width && !scroll.height)) return props.children;

  return (
    <ScrollArea
      style={{
        width: scroll.width,
        height: scroll.height,
      }}
    >
      {props.children}
    </ScrollArea>
  );
};
