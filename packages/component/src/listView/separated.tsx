import { ListViewProps } from "./listView";
import { ListView } from ".";
import { useMemo } from "react";
import React from "react";

export interface SeparatedListViewProps<T> extends ListViewProps<T> {
  renderSeparator: (item: T, index: number) => React.ReactNode;
}

export const SeparatedListView = <T,>(props: SeparatedListViewProps<T>) => {
  const { renderSeparator, renderItem, ...rest } = props;
  const length = useMemo(
    () => props.dataSource?.length ?? 0,
    [props.dataSource]
  );

  return (
    <ListView
      renderItem={(item: T, index) => (
        <React.Fragment key={index}>
          {renderItem(item, index)}
          {index + 1 < length ? renderSeparator?.(item, index) : null}
        </React.Fragment>
      )}
      {...rest}
    />
  );
};
