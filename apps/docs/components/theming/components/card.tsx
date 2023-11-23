import { PropsWithChildren } from "react";

export const Card = (props: PropsWithChildren) => {
  return <div className="shadow-lg p-3">{props.children}</div>;
};
