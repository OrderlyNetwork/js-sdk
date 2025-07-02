import { FC, useCallback, useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  Sheet,
  SheetContent,
  modal,
  useModal,
  VectorIcon,
  SwapHorizIcon,
  PeopleIcon,
  Text,
} from "@orderly.network/ui";
import { MainLogo } from "../main/mainLogo";
import { RouterAdapter, RouteOption } from "../scaffold";
import { SubAccountWidget } from "../subAccount";
import {
  CommunityDiscord,
  CommunityDune,
  CommunityTG,
  CommunityX,
} from "./communityIcon";
import { LeftNavState } from "./leftNav.script";
import { LeftNavItem, LeftNavProps } from "./leftNav.type";

type LeftNavUIProps = LeftNavProps &
  LeftNavState & {
    className?: string;
    logo?: {
      src: string;
      alt: string;
    };
    routerAdapter?: RouterAdapter;
    showSubAccount?: boolean;
  };

export const LeftNavUI: FC<LeftNavUIProps> = (props) => {
  const showModal = useCallback(() => {
    modal.show(LeftNavSheet, {
      ...props,
    });
  }, []);

  return (
    <div onClick={showModal} className={props?.className}>
      <VectorIcon />
    </div>
  );
};

const LeftNavSheet = modal.create<LeftNavUIProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  const { state } = useAccount();
  const { t } = useTranslation();

  const showSubAccount = useMemo(
    () => state.status >= AccountStatusEnum.EnableTrading,
    [state.status],
  );

  const subAccountTrigger = useMemo(() => {
    const name =
      state.accountId === state.mainAccountId
        ? t("common.mainAccount")
        : t("common.subAccount");
    return (
      <div className="oui-flex oui-w-full oui-cursor-pointer oui-items-center oui-gap-2 oui-rounded-xl oui-bg-base-5 oui-p-3">
        <div>
          <PeopleIcon />
        </div>
        <div className="oui-flex oui-flex-col oui-gap-1 oui-font-semibold">
          <div className="oui-text-sm oui-text-base-contrast">{name}</div>
          <Text.formatted
            rule="address"
            className="oui-text-2xs oui-text-base-contrast-36"
          >{`ID: ${state.accountId}`}</Text.formatted>
        </div>
        <div className="oui-ml-auto">
          <SwapHorizIcon />
        </div>
      </div>
    );
  }, [state, t]);

  const openExternalLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="oui-w-[276px] oui-bg-base-8">
        <div className="oui-relative oui-flex oui-h-full oui-flex-col oui-gap-3">
          {props?.products}
          <div className="oui-mt-3 [&_img]:!oui-h-[24px]">
            <MainLogo {...props?.logo} />
          </div>
          {showSubAccount && (
            <SubAccountWidget customTrigger={subAccountTrigger} />
          )}
          <div className="oui-flex oui-flex-col">
            {props?.menus?.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                onClick={props?.routerAdapter?.onRouteChange}
              />
            ))}
          </div>
          <div className="oui-absolute oui-bottom-6 oui-flex oui-w-full oui-flex-col oui-gap-4">
            <div className="oui-flex oui-items-center oui-justify-around">
              {props.telegramUrl && (
                <div
                  onClick={() => openExternalLink(props.telegramUrl as string)}
                >
                  <CommunityTG width={24} height={24} />
                </div>
              )}
              {props.twitterUrl && (
                <div
                  onClick={() => openExternalLink(props.twitterUrl as string)}
                >
                  <CommunityX width={24} height={24} />
                </div>
              )}
              {props.discordUrl && (
                <div
                  onClick={() => openExternalLink(props.discordUrl as string)}
                >
                  <CommunityDiscord width={24} height={24} />
                </div>
              )}
              {props.duneUrl && (
                <div
                  onClick={() => openExternalLink(props.duneUrl as string)}
                  className="oui-mb-1"
                >
                  <CommunityDune />
                </div>
              )}
            </div>
            <div
              className="oui-text-center oui-text-2xs oui-font-semibold oui-text-primary oui-underline"
              onClick={() => openExternalLink(props.feedbackUrl as string)}
            >
              Share your feedback
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

type NavItemProps = {
  item: LeftNavItem;
  onClick?: (option: RouteOption) => void;
};

const NavItem: FC<NavItemProps> = ({ item, onClick }) => {
  const onItemClick = () => {
    onClick?.({
      href: item.href,
      name: item.name,
      scope: "leftNav",
    });
  };
  return (
    <div
      className="oui-flex oui-items-center oui-gap-2 oui-px-3 oui-py-4"
      onClick={onItemClick}
    >
      <div>{item.icon}</div>
      <div className="oui-text-base oui-font-semibold oui-text-base-contrast-80">
        {item.name}
      </div>
      {item.trailing}
    </div>
  );
};
