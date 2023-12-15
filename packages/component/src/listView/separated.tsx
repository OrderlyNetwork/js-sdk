import { ListViewProps } from "./listView";
import { ListView } from ".";
import { Fragment, ReactNode, useMemo } from "react";

export interface SeparatedListViewProps<T, D> extends ListViewProps<T, D> {
  renderSeparator: (item: T, index: number) => ReactNode;
}

export const SeparatedListView = <T, D>(
  props: SeparatedListViewProps<T, D>
) => {
  const { renderSeparator, renderItem, ...rest } = props;
  const length = useMemo(
    () => props.dataSource?.length ?? 0,
    [props.dataSource]
  );

  return (
    <ListView
      renderItem={(item: T, index) => (
        <Fragment key={index}>
          {renderItem(item, index)}
          {index + 1 < length ? renderSeparator?.(item, index) : null}
        </Fragment>
      )}
      {...rest}
    />
  );
};
