import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text, ChevronLeftIcon } from "@orderly.network/ui";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { ChainMenuWidget } from "../chainMenu";
import { LanguageSwitcherWidget } from "../languageSwitcher";
import { RouterAdapter } from "../scaffold";
import { MainLogo } from "./mainLogo";
import { MainNavWidgetProps } from "./mainNav.widget";

type Props = {
  current?: string;
  subItems?: {
    name: string;
    href: string;
  }[];
  routerAdapter?: RouterAdapter;
} & MainNavWidgetProps;

export const MobileTopNav: FC<Props> = (props) => {
  const { t } = useTranslation();

  const title = useMemo(() => {
    if (props?.initialMenu === "/" || props?.initialMenu === "/trade") {
      return <MainLogo {...props?.logo} />;
    }
    const menu = props?.mainMenus?.find(
      (menu) => menu.href === props?.initialMenu,
    );
    return (
      <Text className="oui-text-base-contrast-98 oui-text-2xl oui-font-bold">
        {menu?.name}
      </Text>
    );
  }, [props, t]);

  const isRewards = useMemo(() => {
    return (
      Array.isArray(props?.initialMenu) ||
      props?.initialMenu?.includes("/rewards")
    );
  }, [props?.initialMenu]);

  const isSub = useMemo(() => {
    if (isRewards) return true;
    if (props?.current && props.current !== props.initialMenu) return true;
    return false;
  }, [props?.initialMenu, props?.current, isRewards]);

  const subTitle = useMemo(() => {
    if (isRewards) return t("tradingRewards.rewards");
    if (props?.subItems?.some((item) => item.href === props?.current)) {
      return props?.subItems?.find((item) => item.href === props?.current)
        ?.name;
    }
    return null;
  }, [props?.subItems, props?.current]);

  const onBack = () => {
    let target = props.mainMenus?.find(
      (item) => item.href === props.initialMenu,
    );
    if (isRewards) {
      target = {
        name: t("common.portfolio"),
        href: "/portfolio",
      };
    }
    props?.routerAdapter?.onRouteChange(target as any);
  };

  if (isSub) {
    return (
      <Flex
        width={"100%"}
        height={44}
        px={3}
        direction={"row"}
        itemAlign={"center"}
        justify={"center"}
        className="oui-relative"
      >
        <ChevronLeftIcon
          className="oui-absolute oui-left-6 oui-text-base-contrast-54"
          onClick={onBack}
        />
        <Text className="oui-text-base-contrast-98 oui-text-base oui-font-bold">
          {subTitle}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      width={"100%"}
      height={44}
      px={3}
      itemAlign={"center"}
      justify={"between"}
    >
      <Flex>{title}</Flex>
      <Flex gapX={2}>
        <LanguageSwitcherWidget />
        <ChainMenuWidget />
        <WalletConnectButtonExtension />
      </Flex>
    </Flex>
  );
};
