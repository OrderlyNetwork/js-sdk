import { ReactNode } from "react";

export type LeftNavProps = {
  /** custom leading */
  leading?: ReactNode;
  menus?: LeftNavItem[];
  twitterUrl?: string;
  telegramUrl?: string;
  discordUrl?: string;
  duneUrl?: string;
  feedbackUrl?: string;
  customLeftNav?: ReactNode;
};

export type LeftNavItem = {
  name: string;
  href: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  customRender?: ReactNode;
};
