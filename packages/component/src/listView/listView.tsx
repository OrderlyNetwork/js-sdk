import React from "react";
import { FC, useEffect, useMemo, useRef } from "react";
import { EmptyView } from "./emptyView";
import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";

export interface ListViewProps<T> {
  dataSource: T[] | null | undefined;
  renderItem: (item: T, index: number) => React.ReactNode;
  //
  className?: string;
  isLoading?: boolean;

  onEndReached?: () => void;
}

export const ListView = <T extends unknown>(props: ListViewProps<T>) => {
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      if (props.isLoading) {
        return;
      }
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          props.onEndReached?.();
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, options);

    return () => {
      observer.current?.disconnect();
    };
  }, [props.onEndReached, props.isLoading, props.dataSource]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    observer.current?.observe(sentinelRef.current!);
  }, []);

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
      <div className="list-view-inner space-y-3">{listViewElement}</div>
      <div ref={sentinelRef} />
      {loadingViewElement}
    </div>
  );
};
