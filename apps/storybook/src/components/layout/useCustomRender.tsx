import { useCallback } from "react";
import { Flex, useScreen } from "@veltodefi/ui";
import { MainNavWidgetProps } from "@veltodefi/ui-scaffold";

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
            {components.languageSwitcher}
            {components.subAccount}
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
