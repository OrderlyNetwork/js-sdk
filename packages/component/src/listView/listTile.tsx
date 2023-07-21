import { FC, PropsWithChildren } from "react";
import { cva, VariantProps, cx } from "class-variance-authority";

interface ListTileProps {
  className?: string;
}

export const ListTile: FC<PropsWithChildren<ListTileProps>> = (props) => {
  return <div className={cx("p-4", props.className)}>{props.children}</div>;
};
