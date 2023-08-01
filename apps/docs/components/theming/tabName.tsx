import { FC } from "react";

interface TabNameProps {
  name: string;
}

export const TabName: FC<TabNameProps> = (props) => {
  return <div className={"flex w-[120px]"}>{props.name}</div>;
};
