import { FC } from "react";
import { useLeftNavState } from "./leftNav.script";
import { LeftNavProps } from "./leftNav.type";

export const LeftNavWidget: FC<LeftNavProps> = (props) => {
  const state = useLeftNavState();
  return <div>LeftNavWidget</div>;
};
