import React, { ForwardedRef, forwardRef, useImperativeHandle } from "react";
import { useMemo, useRef } from "react";
import { cnBase, cn } from "tailwind-variants";
import { Flex } from "../flex";
import { Spinner } from "../spinner";
import { EmptyDataState } from "../table";
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
  emptyView?: React.ReactNode;
}

export type ListViewRef = ForwardedRef<{
  scroll: (direction: { x: number; y: number }) => void;
}>;

const ListViewInner = <T extends unknown, D extends unknown>(
  props: ListViewProps<T, D>,
  ref: ListViewRef,
) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEndReached(sentinelRef, () => {
    if (!props.isLoading) {
      props.loadMore?.();
    }
  });

  const emptyDataSouce = useMemo(() => {
    return Array.isArray(props.dataSource) && props.dataSource.length <= 0;
  }, [props.dataSource]);

  const listViewElement = useMemo(() => {
    if (!props.dataSource) {
      return null;
    }

    if (emptyDataSouce) {
      return (
        props.emptyView || (
          <Flex
            direction={"column"}
            height={"100%"}
            itemAlign={"center"}
            justify={"center"}
            mt={3}
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
  }, [emptyDataSouce, props.dataSource, props.extraData, props.emptyView]);

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
        "oui-relative oui-min-h-[180px] oui-custom-scrollbar oui-overflow-auto",
        props.className,
      )({
        twMerge: true,
      })}
    >
      <div
        className={cn(
          "oui-space-y-3 oui-h-full oui-w-full",
          emptyDataSouce &&
            "oui-absolute oui-left-0 oui-right-0 oui-top-0 oui-bottom-0",
          props.contentClassName,
        )({ twMerge: true })}
      >
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
  },
) => JSX.Element;
