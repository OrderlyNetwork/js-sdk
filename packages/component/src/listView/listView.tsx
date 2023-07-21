import { FC } from "react";

export interface ListViewProps<T> {
  dataSource: T[];
  renderItem: (item: T) => React.ReactNode;
  //
  className?: string;
}

export const ListView = <T extends unknown>(props: ListViewProps<T>) => {
  return (
    <div className={props.className}>
      {props.dataSource.map((item) => props.renderItem(item))}
    </div>
  );
};
