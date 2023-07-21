import { FC, PropsWithChildren, useContext } from "react";
import { TabContext } from "./tabContext";

export const TabContent: FC<PropsWithChildren> = (props) => {
  const { contentVisible } = useContext(TabContext);

  if (!contentVisible) {
    return null;
  }

  return <div>{props.children}</div>;
};
