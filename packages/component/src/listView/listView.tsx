import React from "react";
import { useMemo, useRef } from "react";
import { EmptyView } from "./emptyView";
import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";
import { useEndReached } from "./useEndReached";

export interface ListViewProps<T> {
  dataSource: T[] | null | undefined;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  contentClassName?: string;
  isLoading?: boolean;
  loadMore?: () => void;
}

export const ListView = <T extends unknown>(props: ListViewProps<T>) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
      return <EmptyView />;
    }

    return props.dataSource.map((item, index) => (
      <React.Fragment key={index}>
        {props.renderItem(item, index)}
      </React.Fragment>
    ));
  }, [props.dataSource]);

  const loadingViewElement = useMemo(() => {
    if (!props.isLoading && !!props.dataSource) {
      return null;
    }

    return (
      <div className="absolute w-full h-full z-20 left-0 top-0 bottom-0 right-0 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }, [props.isLoading, props.dataSource]);

  return (
    <div className={cn("relative min-h-[180px]", props.className)}>
      <div className={cn("list-view-inner space-y-3", props.contentClassName)}>
        {listViewElement}
      </div>
      <div
        ref={sentinelRef}
        className="relative invisible h-[1px] top-[-300px]"
      />
      {loadingViewElement}
    </div>
  );
};
