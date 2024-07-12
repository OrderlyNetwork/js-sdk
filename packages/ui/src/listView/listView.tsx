import React, { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { useMemo, useRef } from "react";
import { useEndReached } from "./useEndReached";
import { Spinner } from "../spinner";
import { cn, EmptyDataState, Flex } from "..";
import { EmptyView } from "../empty";

export interface ListViewProps<T, D extends unknown> {
  dataSource: T[] | null | undefined;
  renderItem: (item: T, index: number, extraData?: D) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  isLoading?: boolean;
  loadMore?: () => void;

  style?: React.CSSProperties;

  extraData?: D;
  emptyView?: React.ReactNode;
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
      return (
        props.emptyView || (
          <Flex
            direction={"column"}
            height={"100%"}
            itemAlign={"center"}
            justify={"center"}
          >
            <EmptyDataState />
          </Flex>
        )
      );
    }

    return props.dataSource.map((item, index) => (
      <React.Fragment key={index}>
        {props.renderItem(item, index, props.extraData)}
      </React.Fragment>
    ));
  }, [props.dataSource, props.extraData, props.emptyView]);

  const loadingViewElement = useMemo(() => {
    if ((props.dataSource?.length || 0) === 0) return null;
    if (!props.isLoading) {
      return null;
    }

    return (
      <div className="oui-flex oui-py-2 oui-justify-center oui-items-center">
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
      className={cn(
        "oui-relative oui-min-h-[180px] oui-scrollbar-vertical oui-overflow-auto",
        props.className
      )}
    >
      <div className={cn("oui-space-y-3 oui-h-full", props.contentClassName)}>
        {listViewElement}
      </div>
      <div
        ref={sentinelRef}
        className="oui-relative oui-invisible oui-h-[1px] oui-top-[-300px]"
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
