import { FC, useEffect, useMemo, useRef } from "react";
import { EmptyView } from "./emptyView";

export interface ListViewProps<T> {
  dataSource: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  //
  className?: string;

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
  }, [props.onEndReached]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    observer.current?.observe(sentinelRef.current!);
  }, []);

  const listViewElement = useMemo(() => {
    if (!Array.isArray(props.dataSource) || props.dataSource.length <= 0) {
      return <EmptyView />;
    }

    return props.dataSource.map((item, index) => props.renderItem(item, index));
  }, [props.dataSource]);

  return (
    <div className={props.className}>
      <div className="list-view-inner">{listViewElement}</div>
      <div ref={sentinelRef} />
    </div>
  );
};
