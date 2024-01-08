import { FC, PropsWithChildren } from "react";

export const Content: FC<PropsWithChildren> = (props) => {
  return <div>{props.children}</div>;
};
