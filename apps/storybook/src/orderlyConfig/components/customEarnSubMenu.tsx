import React from "react";
import { useLocation, useNavigate } from "react-router";
import { generatePath } from "@veltodefi/i18n";
import { i18n } from "@veltodefi/i18n";
import { EarnIcon, StakeIcon, VaultsIcon } from "../../components/icons";
import { PathEnum } from "../../playground/constant";

type MenuItem = {
  key: string;
  className?: string;
  onClick: () => void;
  activeIcon: React.ReactNode;
  title: string;
  description: string;
  showArrow?: boolean;
  isActive?: boolean;
};

const MenuItemRow: React.FC<MenuItem> = (props) => {
  const {
    className,
    onClick,
    activeIcon,
    title,
    description,
    showArrow,
    isActive,
  } = props;
  return (
    <div
      className={`oui-flex oui-items-center oui-justify-between oui-p-3 oui-rounded-md oui-cursor-pointer ${
        isActive ? "oui-bg-base-5" : "hover:oui-bg-base-6"
      } ${className ?? ""}`}
      onClick={onClick}
    >
      <div className="oui-flex oui-items-center oui-gap-2">
        <div className="oui-w-5 oui-h-5">{activeIcon}</div>
        <div>
          <div className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
            {title}
          </div>
          {description && (
            <div className="oui-text-xs oui-text-base-contrast-36">
              {description}
            </div>
          )}
        </div>
      </div>
      {showArrow !== false && (
        <div className="oui-text-base-contrast-36">›</div>
      )}
    </div>
  );
};

export const customEarnSubMenuRender = () => {
  return () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isVaultsActive =
      location.pathname.endsWith(PathEnum.Vaults) ||
      location.pathname.includes(`${PathEnum.Vaults}/`);

    const items: MenuItem[] = [
      {
        key: "woofi-earn",
        onClick: () => {
          window.location.href = "https://woofi.com/swap/earn";
        },
        activeIcon: <EarnIcon size={20} />,
        title: i18n.t("extend.woofiEarn"),
        description: i18n.t("extend.woofiEarn.description"),
        showArrow: false,
      },
      {
        key: "woofi-stake",
        className: "oui-mt-1",
        onClick: () => {
          window.location.href = "https://woofi.com/swap/stake";
        },
        activeIcon: <StakeIcon size={20} />,
        title: i18n.t("extend.wooStake"),
        description: i18n.t("extend.wooStake.description"),
        showArrow: false,
      },
      {
        key: "vaults",
        className: "oui-mt-1",
        onClick: () => {
          navigate(generatePath({ path: PathEnum.Vaults }));
        },
        activeIcon: <VaultsIcon size={20} />,
        title: i18n.t("extend.vaults"),
        description: i18n.t("extend.vaults.description"),
        showArrow: false,
        isActive: isVaultsActive,
      },
    ];

    return (
      <div className="oui-flex oui-p-1 oui-gap-1 oui-bg-base-8 oui-rounded-lg oui-border oui-border-line-6">
        <div className="oui-w-[240px] oui-flex-shrink-0 oui-rounded-lg">
          {items.map(({ key, className, ...props }) => (
            <MenuItemRow key={key} className={className} {...props} />
          ))}
        </div>
      </div>
    );
  };
};
