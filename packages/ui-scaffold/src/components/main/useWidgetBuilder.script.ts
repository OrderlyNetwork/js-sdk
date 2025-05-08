import { useMemo, useState } from "react";
import { useScaffoldContext } from "../scaffold";
import {
  useAccount,
  useEventEmitter,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import type { MainNavItem } from "./mainMenus/navItem";
import { type MainNavWidgetProps } from "./mainNav.widget";

// export type CampaignPosition = "menuLeading" | "menuTailing" | "navTailing";
export enum CampaignPositionEnum {
  menuLeading = "menuLeading",
  menuTailing = "menuTailing",
  navTailing = "navTailing",
}

type UseMainNavBuilderProps = Omit<
  MainNavWidgetProps,
  "classNames" | "children"
>;

export const useMainNavBuilder = (props: UseMainNavBuilderProps) => {
  const { onItemClick, campaignPosition = CampaignPositionEnum.navTailing } =
    props;
  const { state } = useAccount();
  const { routerAdapter } = useScaffoldContext();
  const { connectedChain } = useWalletConnector();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const [current, setCurrent] = useState(() => {
    if (typeof props.initialMenu === "undefined") return [];

    return !Array.isArray(props.initialMenu)
      ? [props.initialMenu]
      : props.initialMenu;
  });

  const onItemClickHandler = (scope: string) => (item: MainNavItem[]) => {
    const lastItem = item[item.length - 1];

    if (!lastItem) return;

    /**
     * If the target is not _blank, we should update the current state
     */
    if (lastItem.target !== "_blank") {
      setCurrent(item.map((item) => item.href));
    }

    const current = item[item.length - 1];
    const args = {
      href: current.href,
      name: current.name,
      scope,
      target: current.target,
    };

    if (typeof onItemClick === "function") {
      onItemClick(args);
      return;
    }

    routerAdapter?.onRouteChange(args);
  };

  const mainNavConfig = useMemo(() => {
    const config = {
      leading: null,
      trailing: null,
      logo: {},
      mainMenus: [
        // { name: "Trading", href: "/trading" },
        // { name: "Portfolio", href: "/portfolio" },
        // { name: "Markets", href: "/markets" },
        // { name: "Rewards", href: "/rewards" },
      ],
      products: [
        // { name: "Swap", href: "/swap" },
        // { name: "Perps", href: "/perps" },
      ],
      ...props,
      campaignPosition,
    };
    if (props.leading) {
      config.leading = props.leading;
    }

    if (props.trailing) {
      config.trailing = props.trailing;
    }

    if (props.campaigns) {
      if (campaignPosition === CampaignPositionEnum.menuTailing) {
        config.mainMenus = [...config.mainMenus, props.campaigns];
      } else if (campaignPosition === CampaignPositionEnum.menuLeading) {
        config.mainMenus = [props.campaigns, ...config.mainMenus];
      } else {
        config.campaigns = props.campaigns;
      }
    }

    return config;
  }, [props]);

  const converted: any = {};

  if (mainNavConfig.mainMenus && mainNavConfig.mainMenus.length) {
    converted.mainMenus = {
      items: mainNavConfig.mainMenus,
      /**
       * @type string
       * The current item of the router
       */
      current,
      onItemClick: onItemClickHandler("mainMenu"),
      // onItemClick: (item: MainNavItem[]) => {
      //   const lastItem = item[item.length - 1];

      //   if (!lastItem) return;

      //   /**
      //    * If the target is not _blank, we should update the current state
      //    */
      //   if (lastItem.target !== "_blank") {
      //     setCurrent(item.map((item) => item.href));
      //   }

      //   const current = item[item.length - 1];
      //   const args = {
      //     href: current.href,
      //     name: current.name,
      //     scope: "mainMenu",
      //     target: current.target,
      //   };

      //   if (typeof onItemClick === "function") {
      //     onItemClick(args);
      //     return;
      //   }

      //   routerAdapter?.onRouteChange(args);
      // },
    };
  }

  if (mainNavConfig.campaigns && mainNavConfig.campaigns.children?.length) {
    converted.campaigns = {
      item: mainNavConfig.campaigns,
      current,
      onItemClick: onItemClickHandler("campaign"),
      // onItemClick: (item: MainNavItem[]) => {
      //   const lastItem = item[item.length - 1];

      //   if (!lastItem) return;

      //   /**
      //    * If the target is not _blank, we should update the current state
      //    */
      //   if (lastItem.target !== "_blank") {
      //     setCurrent(item.map((item) => item.href));
      //   }

      //   const current = item[item.length - 1];
      //   const args = {
      //     href: current.href,
      //     name: current.name,
      //     scope: "campaign",
      //     target: current.target,
      //   };

      //   if (typeof onItemClick === "function") {
      //     onItemClick(args);
      //     return;
      //   }

      //   routerAdapter?.onRouteChange(args);
      // },
    };
  }

  // return converted;

  return {
    // currentProduct,
    // logo: mainNavConfig.logo,
    ...mainNavConfig,

    isConnected: !!connectedChain,
    wrongNetwork,
    ...converted,
    status: state.status,
    disabledConnect,
  };
};

export type MainNavBuilder = ReturnType<typeof useMainNavBuilder>;
