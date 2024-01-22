import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Row } from "./row";
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

export interface TableProps<RecordType> extends TBodyProps<RecordType> {
  columns: Column<RecordType>[];
  dataSource?: RecordType[] | null;
  /**
   * @description 加载中
   * @default false
   */
  loading?: boolean;
  className?: string;
  headerClassName?: string;
}

export const Table = <RecordType extends unknown>(
  props: TableProps<RecordType>
) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { dataSource, columns, ...rest } = props;

  // console.log("props sortable:: ", props.sortable);

  const maskElement = useMemo(() => {
    if (Array.isArray(props.dataSource) && props.dataSource?.length > 0) {
      return null;
    }

    let content: ReactNode = <Spinner />;
    if (props.dataSource?.length === 0) {
      content = <EmptyView />;
    }
    return (
      <div className="orderly-absolute orderly-w-full orderly-z-20 orderly-left-0 orderly-top-0 orderly-bottom-0 orderly-right-0 orderly-flex orderly-justify-center orderly-items-center orderly-bg-base-900/30 orderly-backdrop-blur-sm">
        {content}
      </div>
    );
  }, [props.dataSource]);

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
      // wrapRef.current.scrollWidth - wrapRef.current.scrollLeft === wrapRef.current.clientWidth
      wrapRef.current.scrollLeft + wrapRef.current.clientWidth >=
      wrapRef.current.scrollWidth
    ) {
      wrapRef.current.setAttribute("data-right", "free");
    } else {
      wrapRef.current.setAttribute("data-right", "fixed");
    }
  }, 50);

  useEffect(() => {
    if (!wrapRef.current) {
      return;
    }

    onScroll(0);
    // use ResizeObserver observe wrapRef
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onScroll(entry.target.scrollLeft);
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
    <TableProvider columns={props.columns} dataSource={props.dataSource}>
      <div
        ref={wrapRef}
        className={cn(
          "orderly-relative orderly-h-full orderly-flex-col orderly-overflow-x-auto orderly-peer",
          props.loading && "orderly-overflow-hidden",
          props.className
        )}
        onScroll={(e) => onScroll(e.currentTarget.scrollLeft)}
      >
        <TableHeader
          columns={props.columns}
          className={props.headerClassName}
          bordered={props.bordered}
          justified={props.justified}
        />

        <table
          className={cn(
            "orderly-border-collapse orderly-w-full orderly-table-fixed"
          )}
        >
          <ColGroup columns={props.columns} />

          <TBody {...rest} />
        </table>
        {maskElement}
      </div>
      <FixedDivide />
    </TableProvider>
  );
};
