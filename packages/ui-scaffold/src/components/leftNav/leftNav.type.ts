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
  target?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  customRender?: (option: {
    name: string;
    href: string;
    isActive?: boolean;
  }) => React.ReactNode;
  /**
   * if true, this item will only be shown in the main account
   * @default false
   **/
  onlyInMainAccount?: boolean;
};
