import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { Column } from "./col";
import { TableHeader } from "./thead";
import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";
import { EmptyView } from "@/listView/emptyView";
import { ColGroup } from "./colgroup";
import { TableProvider } from "./tableContext";
import { useDebouncedCallback } from "@orderly.network/hooks";
import { FixedDivide } from "./fixedDivide";
import { TBody, TBodyProps } from "./tbody";
import { EndReachedBox } from "@/listView/endReachedBox";

export interface TableProps<RecordType> extends TBodyProps<RecordType> {
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
  loadMore?: () => void;
}

export const Table = <RecordType extends unknown>(
  props: TableProps<RecordType>
) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { dataSource, columns, showMaskElement = true, ...rest } = props;

  const [maskLayout, setMaskLayout] = useState({
    left: 0,
    right: 0,
    top: 44.5,
    bottom: 0,
  });

  const maskElement = useMemo(() => {
    if (Array.isArray(props.dataSource) && props.dataSource?.length > 0) {
      return null;
    }

    let content: ReactNode = <Spinner />;
    if (props.dataSource?.length === 0 && !props.loading) {
      content = <EmptyView />;
    }
    return (
      <div
        className="orderly-absolute orderly-z-20 orderly-flex-col orderly-justify-center orderly-items-center orderly-bg-base-900/30 orderly-backdrop-blur-sm"
        style={{
          ...maskLayout,
        }}
      >
        {content}
      </div>
    );
  }, [props.dataSource, props.loading, maskLayout]);

  const needFixed = useMemo(() => {
    return props.columns.some(
      (col) => col.fixed === "left" || col.fixed === "right"
    );
  }, [props.columns]);

  const onScroll = useDebouncedCallback((scrollLeft: number) => {
    // console.log(scrollLeft);
    if (!wrapRef.current || !needFixed) {
      return;
    }

    if (scrollLeft > 0) {
      // setLeftFixed(true);
      wrapRef.current?.setAttribute("data-left", "fixed");
    } else {
      wrapRef.current?.setAttribute("data-left", "free");
    }

    if (
      wrapRef.current.scrollLeft + wrapRef.current.clientWidth >=
      wrapRef.current.scrollWidth
    ) {
      wrapRef.current.setAttribute("data-right", "free");
    } else {
      wrapRef.current.setAttribute("data-right", "fixed");
    }
  }, 50);

  const onMaskResize = useDebouncedCallback((entry: ResizeObserverEntry) => {
    // console.log("mask resize", entry);
    const leftDivide = entry.target.parentElement?.querySelector(
      ".table-left-fixed-divide"
    );
    const rightDivide = entry.target.parentElement?.querySelector(
      ".table-right-fixed-divide"
    );

    const tableHeader = wrapRef.current?.querySelector(
      ".orderly-ui-table-thead"
    );

    if (leftDivide) {
      const left = leftDivide.getBoundingClientRect();
      console.log("leftDivide", left);
      // setMaskLayout((layout) => ({ ...layout, left }));
    }

    if (rightDivide) {
      const right = rightDivide.getBoundingClientRect();

      const r = right.right > 0 ? entry.contentRect.right - right.right : 0;
      setMaskLayout((layout) => ({
        ...layout,
        right: r,
      }));
    }

    if (tableHeader) {
      const top = tableHeader.getBoundingClientRect();

      setMaskLayout((layout) => ({ ...layout, top: top.height }));
    }
  }, 200);

  useEffect(() => {
    if (!wrapRef.current) {
      return;
    }

    onScroll(0);
    // use ResizeObserver observe wrapRef
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onScroll(entry.target.scrollLeft);
        onMaskResize(entry);
      }
    });

    resizeObserver.observe(wrapRef.current!);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
        ref={wrapRef}
        className={cn(
          "orderly-ui-table orderly-relative orderly-flex-col orderly-overflow-x-auto orderly-peer",
          props.loading && "orderly-overflow-hidden",
          props.className
        )}
        style={{ height: "calc(100% - 2px)" }}
        onScroll={(e) => onScroll(e.currentTarget.scrollLeft)}
      >
        <TableHeader
          columns={props.columns}
          className={props.headerClassName}
          bordered={props.bordered}
          justified={props.justified}
        />
        <EndReachedBox
          onEndReached={() => {
            // if (!props.loading) {
            props.loadMore?.();
            // }
          }}
        >
          <table
            className={cn(
              "orderly-table-fixed orderly-border-collapse orderly-w-full"
            )}
          >
            <ColGroup columns={props.columns} />
            <TBody {...rest} />
          </table>
        </EndReachedBox>
        {showMaskElement && maskElement}
      </div>
      <FixedDivide />
    </TableProvider>
  );
};
