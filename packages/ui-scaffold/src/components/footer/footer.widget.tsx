import { useScreen } from "@orderly.network/ui";
import { useFooterScript } from "./footer.script";
import { Footer } from "./footer.ui";
import { FooterMobile } from "./footer.ui.mobile";
import { ReactNode } from "react";
import { RouterAdapter } from "../scaffoldContext";
export type FooterProps = {
  telegramUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  trailing?: ReactNode;
} & FooterMobileProps;

export type FooterMobileNavItem = {
  name: string;
  href: string;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
};

export type FooterMobileProps = {
  mobileMainMenus?: FooterMobileNavItem[];
  current?: string;
  onRouteChange?: RouterAdapter["onRouteChange"];
};

export const FooterWidget = (props: FooterProps) => {
  const state = useFooterScript();
  const { isMobile } = useScreen();
  const { mobileMainMenus, ...rest } = props;
  return isMobile ? <FooterMobile mainMenus={mobileMainMenus} {...rest} /> : <Footer {...state} {...props} />;
};
