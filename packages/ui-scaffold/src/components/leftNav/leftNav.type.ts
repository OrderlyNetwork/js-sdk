import { ReactNode } from "react";

export type LeftNavProps = {
  items: LeftNavItem[];
};

export type LeftNavItem = {
  name: string;
  href: string;
  icon?: ReactNode;
};
