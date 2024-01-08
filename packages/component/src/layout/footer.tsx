import { FC, HTMLAttributes, PropsWithChildren } from "react";

export interface FooterProps extends HTMLAttributes<HTMLDivElement> {
  fixed?: boolean;
}

export const Footer: FC<PropsWithChildren<FooterProps>> = (props) => {
  return <div>{props.children}</div>;
};
