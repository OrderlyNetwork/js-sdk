import { ListViewProps } from "./listView";
import { ListView } from ".";
import { useMemo } from "react";

export interface SeparatedListViewProps<T> extends ListViewProps<T> {
  renderSeparator: (item: T, index: number) => React.ReactNode;
}

export const SeparatedListView = <T,>(props: SeparatedListViewProps<T>) => {
  const { renderSeparator, ...rest } = props;
  const length = useMemo(
    () => props.dataSource?.length ?? 0,
    [props.dataSource]
  );

  return ListView({
    ...rest,
    renderItem: (item, index) => (
      <>
        {props.renderItem(item, index)}
        {index + 1 < length ? renderSeparator?.(item, index) : null}
      </>
    ),
  });
};
