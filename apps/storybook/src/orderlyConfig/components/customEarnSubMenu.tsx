import React, { useState } from "react";
import { useLocation } from "react-router";
import { i18n } from "@orderly.network/i18n";
import { EarnIcon, StakeIcon, VaultsIcon } from "../../components/icons";
import { PathEnum } from "../../playground/constant";
import { useNav } from "../../playground/hooks/useNav";
import {
  MenuItem,
  MenuItemRow,
  TAB_CONTENT_ANIMATION_CLASSNAME,
} from "./SubMenuComponents";
import { VaultsTabContent } from "./VaultsTabContent";
import { WoofiEarnTabContent } from "./WoofiEarnTabContent";

export const customEarnSubMenuRender = () => {
  return () => {
    const { onRouteChange } = useNav();
    const location = useLocation();
    const [hoverTab, setHoverTab] = useState<string | null>(null);

    const isVaultsActive =
      location.pathname.endsWith(PathEnum.Vaults) ||
      location.pathname.includes(`${PathEnum.Vaults}/`);

    const items: MenuItem[] = [
      {
        key: "woofi-earn",
        onClick: () => {
          window.location.href = "https://woofi.com/swap/earn";
        },
        onMouseEnter: () => setHoverTab("woofi-earn"),
        activeIcon: <EarnIcon size={20} />,
        title: i18n.t("extend.woofiEarn"),
        description: i18n.t("extend.woofiEarn.description"),
        showArrow: true,
      },
      {
        key: "vaults",
        className: "oui-mt-1",
        onClick: () => {
          onRouteChange({
            href: PathEnum.Vaults,
            name: i18n.t("extend.vaults"),
          });
        },
        onMouseEnter: () => setHoverTab("vaults"),
        activeIcon: <VaultsIcon size={20} />,
        title: i18n.t("extend.vaults"),
        description: i18n.t("extend.vaults.description"),
        showArrow: true,
        isActive: isVaultsActive,
      },
      {
        key: "woofi-stake",
        className: "oui-mt-1",
        onClick: () => {
          window.location.href = "https://woofi.com/swap/stake";
        },
        onMouseEnter: () => setHoverTab(null),
        activeIcon: <StakeIcon size={20} />,
        title: i18n.t("extend.wooStake"),
        description: i18n.t("extend.wooStake.description"),
        showArrow: false,
      },
    ];

    const showRightSection =
      isVaultsActive || hoverTab === "vaults" || hoverTab === "woofi-earn";
    const rightSectionState = showRightSection ? "open" : "closed";

    return (
      <div
        className="oui-flex oui-p-1 oui-bg-base-8 oui-rounded-lg oui-border oui-border-line-6"
        onMouseLeave={() => setHoverTab(null)}
      >
        <div className="oui-w-[240px] oui-flex-shrink-0 oui-rounded-lg">
          {items.map(({ key, className, ...props }) => (
            <MenuItemRow key={key} className={className} {...props} />
          ))}
        </div>
        <div
          className={[
            "oui-overflow-hidden",
            "oui-transition-[width,height] oui-duration-120 oui-ease-out",
            "data-[state=open]:oui-w-[280px] data-[state=closed]:oui-w-0",
            "data-[state=open]:oui-h-[415px] data-[state=closed]:oui-h-0",
            "data-[state=closed]:oui-pointer-events-none",
          ].join(" ")}
          data-state={rightSectionState}
        >
          <div
            className={`oui-w-[276px] oui-h-full oui-bg-base-9 oui-rounded-md oui-ml-1 oui-p-1 ${TAB_CONTENT_ANIMATION_CLASSNAME}`}
            data-state={rightSectionState}
          >
            {hoverTab === "woofi-earn" ? (
              <WoofiEarnTabContent isOpen={showRightSection} />
            ) : (
              <VaultsTabContent isOpen={showRightSection} />
            )}
          </div>
        </div>
      </div>
    );
  };
};
