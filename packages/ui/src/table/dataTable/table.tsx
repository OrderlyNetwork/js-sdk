import {
  FC,
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

// interface DataTableFilter {
//   options: {
//     label: string;
//     value: string;
//   }[];
// }

type DataTableFilter = {
  column: string;
  value: string;
};

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
  props: DataTableProps<RecordType>
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

  // const [maskLayout, setMaskLayout] = useState({
  //   left: 0,
  //   right: 0,
  //   top: 44.5,
  //   bottom: 0,
  // });

  // const maskElement = useMemo(() => {
  //   if (Array.isArray(props.dataSource) && props.dataSource?.length > 0) {
  //     return null;
  //   }

  //   let content: ReactNode = <Spinner />;
  //   if (props.dataSource?.length === 0 && !props.loading) {
  //     content = <EmptyView />;
  //   }
  //   return (
  //     <div
  //       className="oui-absolute oui-flex oui-z-20 oui-flex-col oui-justify-center oui-items-center oui-bg-base-900/30 oui-backdrop-blur-sm"
  //       style={{
  //         ...maskLayout,
  //       }}
  //     >
  //       {content}
  //     </div>
  //   );
  // }, [props.dataSource, props.loading, maskLayout]);

  const needFixed = useMemo(() => {
    return props.columns.some(
      (col) => col.fixed === "left" || col.fixed === "right"
    );
  }, [props.columns]);

  // const onScroll = useDebouncedCallback((scrollLeft: number) => {
  //   // console.log(scrollLeft);
  //   if (!wrapRef.current || !needFixed) {
  //     return;
  //   }

  //   if (scrollLeft > 0) {
  //     // setLeftFixed(true);
  //     wrapRef.current?.setAttribute("data-left", "fixed");
  //   } else {
  //     wrapRef.current?.setAttribute("data-left", "free");
  //   }

  //   if (
  //     wrapRef.current.scrollLeft + wrapRef.current.clientWidth >=
  //     wrapRef.current.scrollWidth
  //   ) {
  //     wrapRef.current.setAttribute("data-right", "free");
  //   } else {
  //     wrapRef.current.setAttribute("data-right", "fixed");
  //   }
  // }, 50);

  // const onMaskResize = useDebouncedCallback((entry: ResizeObserverEntry) => {
  //   // console.log("mask resize", entry);
  //   const leftDivide = entry.target.parentElement?.querySelector(
  //     ".table-left-fixed-divide"
  //   );
  //   const rightDivide = entry.target.parentElement?.querySelector(
  //     ".table-right-fixed-divide"
  //   );

  //   const tableHeader = wrapRef.current?.querySelector(
  //     ".oui-ui-table-thead"
  //   );

  //   if (leftDivide) {
  //     const left = leftDivide.getBoundingClientRect();
  //     // console.log("leftDivide", left);
  //     // setMaskLayout((layout) => ({ ...layout, left }));
  //   }

  //   if (rightDivide) {
  //     const right = rightDivide.getBoundingClientRect();

  //     const r = right.right > 0 ? entry.contentRect.right - right.right : 0;
  //     setMaskLayout((layout) => ({
  //       ...layout,
  //       right: r,
  //     }));
  //   }

  //   if (tableHeader) {
  //     const top = tableHeader.getBoundingClientRect();

  //     setMaskLayout((layout) => ({ ...layout, top: top.height }));
  //   }
  // }, 200);

  // useEffect(() => {
  //   if (!wrapRef.current) {
  //     return;
  //   }

  //   onScroll(0);
  //   // use ResizeObserver observe wrapRef
  //   const resizeObserver = new ResizeObserver((entries) => {
  //     for (const entry of entries) {
  //       onScroll(entry.target.scrollLeft);
  //       onMaskResize(entry);
  //     }
  //   });

  //   resizeObserver.observe(wrapRef.current!);

  //   return () => {
  //     resizeObserver.disconnect();
  //   };
  // }, []);

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
      </div>

      <FixedDivide />
    </TableProvider>
  );
};
