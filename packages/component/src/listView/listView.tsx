import React, { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { useMemo, useRef } from "react";
import { EmptyView } from "./emptyView";
import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";
import { useEndReached } from "./useEndReached";

export interface ListViewProps<T, D extends unknown> {
  dataSource: T[] | null | undefined;
  renderItem: (item: T, index: number, extraData?: D) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  isLoading?: boolean;
  loadMore?: () => void;

  style?: React.CSSProperties;

  extraData?: D;
}

export type ListViewRef = ForwardedRef<{
  scroll: (direction: { x: number; y: number }) => void;
}>;

const ListViewInner = <T extends unknown, D extends unknown>(
  props: ListViewProps<T, D>,
  ref: ListViewRef
) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEndReached(sentinelRef, () => {
    if (!props.isLoading) {
      props.loadMore?.();
    }
  });

  const listViewElement = useMemo(() => {
    if (!props.dataSource) {
      return null;
    }

    if (Array.isArray(props.dataSource) && props.dataSource.length <= 0) {
      // @ts-ignore
      return <EmptyView visible />;
    }

    return props.dataSource.map((item, index) => (
      <React.Fragment key={index}>
        {props.renderItem(item, index, props.extraData)}
      </React.Fragment>
    ));
  }, [props.dataSource, props.extraData]);

  const loadingViewElement = useMemo(() => {
    if (!props.isLoading && !!props.dataSource) {
      return null;
    }

    return (
      <div className="orderly-absolute orderly-w-full orderly-h-full orderly-z-20 orderly-left-0 orderly-top-0 orderly-bottom-0 orderly-right-0 orderly-flex orderly-justify-center orderly-items-center">
        <Spinner />
      </div>
    );
  }, [props.isLoading, props.dataSource]);

  useImperativeHandle(ref, () => {
    return {
      scroll: (direction) => {
        containerRef.current?.scroll({
          left: direction.x,
          top: direction.y,
          behavior: "smooth",
        });
      },
    };
  });

  return (
    <div
      style={props.style}
      ref={containerRef}
      className={cn("orderly-relative orderly-min-h-[180px]", props.className)}
    >
      <div
        className={cn(
          "orderly-list-view-inner orderly-space-y-3",
          props.contentClassName
        )}
      >
        {listViewElement}
      </div>
      <div
        ref={sentinelRef}
        className="orderly-relative orderly-invisible orderly-h-[1px] orderly-top-[-300px]"
      />
      {loadingViewElement}
    </div>
  );
};

export const ListView = forwardRef(ListViewInner) as <T, D>(
  props: ListViewProps<T, D> & {
    ref?: ForwardedRef<{
      scroll: (direction: { x: number; y: number }) => void;
    }>;
  }
) => JSX.Element;
