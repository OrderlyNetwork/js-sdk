import { useCallback } from "react";
import { Flex, useScreen } from "@orderly.network/ui";
import { MainNavWidgetProps } from "@orderly.network/ui-scaffold";
import { ThemeSwitcher } from "./themeSwitcher";

export function useCustomRender() {
  const { isMobile } = useScreen();

  const customRender = useCallback(
    (
      components: Parameters<Required<MainNavWidgetProps>["customRender"]>[0],
    ) => {
      // mobile
      if (isMobile) {
        return (
          <Flex width="100%" justify="between">
            <Flex gapX={2}>
              {components.leftNav}
              {components.title}
            </Flex>
            <Flex gapX={2}>
              {components.languageSwitcher}
              {components.scanQRCode}
              {components.linkDevice}
              <ThemeSwitcher />
              {components.chainMenu}
              {components.walletConnect}
            </Flex>
          </Flex>
        );
      }
      // desktop
      return (
        <Flex width="100%" justify="between">
          <Flex gapX={2}>
            {components.title}
            {components.mainNav}
          </Flex>
          <Flex gapX={2}>
            {components.accountSummary}
            {components.linkDevice}
            {components.notify}
            {components.languageSwitcher}
            {components.subAccount}
            <ThemeSwitcher />
            {components.chainMenu}
            {components.walletConnect}
          </Flex>
        </Flex>
      );
    },
    [isMobile],
  );

  return customRender;
}
