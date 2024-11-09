import { PropsWithChildren } from "react";
import { MainNav, MainNavProps } from "./mainNav.ui";
import { MainNavItem } from "./navItem";
import {
  CampaignPositionEnum,
  useMainNavBuilder,
} from "./useWidgetBuilder.script";

export type MainNavWidgetProps = PropsWithChildren<{
  logo?: {
    src: string;
    alt: string;
  };
  mainMenus?: MainNavItem[];

  products?: MainNavItem[];

  campaigns?: MainNavItem;
  campaignPosition?: CampaignPositionEnum;

  initialProduct?: string;
  /**
   * initial menu path, if it has submenus, use array
   * @type string | string[]
   */
  initialMenu?: string | string[];

  onItemClick?: (options: {
    href: string;
    name: string;
    scope?: string;
  }) => void;
}> &
  Pick<MainNavProps, "classNames">;

export const MainNavWidget = (props: MainNavWidgetProps) => {
  const { children, classNames, ...rest } = props;
  const state = useMainNavBuilder(rest);
  return (
    <MainNav classNames={classNames} {...state}>
      {children}
    </MainNav>
  );
};
