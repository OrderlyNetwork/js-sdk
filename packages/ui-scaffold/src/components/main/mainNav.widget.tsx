import { PropsWithChildren, ReactNode } from "react";
import { MainNavItem } from "./mainMenus/navItem";
import { MainNav, MainNavProps } from "./mainNav.ui";
import {
  CampaignPositionEnum,
  useMainNavBuilder,
} from "./useWidgetBuilder.script";

export type MainNavWidgetProps = PropsWithChildren<{
  leading?: ReactNode;
  trailing?: ReactNode;
  logo?: {
    src: string;
    alt: string;
  };
  mainMenus?: MainNavItem[];

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
  /** only works on mobile */
  customRender?: (components: {
    title?: ReactNode;
    languageSwitcher?: ReactNode;
    scanQRCode?: ReactNode;
    subAccount?: ReactNode;
    linkDevice?: ReactNode;
    chainMenu?: ReactNode;
    walletConnect?: ReactNode;
  }) => ReactNode;
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
