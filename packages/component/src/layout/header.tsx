import { FC, PropsWithChildren } from "react";

export const Header: FC<PropsWithChildren> = (props) => {
  return <div>{props.children}</div>;
};
