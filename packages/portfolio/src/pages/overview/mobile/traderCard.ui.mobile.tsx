import { FC } from "react";
import { RefferalAPI as API } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  Flex,
  Text,
  TraderMobileIcon,
  ChevronRightIcon,
  cn,
} from "@orderly.network/ui";
import { RouterAdapter } from "@orderly.network/ui-scaffold";
import { commifyOptional } from "@orderly.network/utils";

type TraderCardMobileProps = {
  referralInfo?: API.ReferralInfo;
  routerAdapter?: RouterAdapter;
};

export const TraderCardMobile: FC<TraderCardMobileProps> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex
      className="
        oui-via-21.6% 
        oui-via-83.23% 
        oui-relative 
        oui-h-[112px] 
        oui-w-full 
        oui-flex-col 
        oui-items-start 
        oui-rounded-xl 
        oui-border
        oui-border-solid 
        oui-border-[rgba(var(--oui-gradient-success-end)/0.54)]
        oui-bg-gradient-to-r
        oui-from-[rgba(var(--oui-gradient-success-end)/0.12)]
        oui-to-[rgba(var(--oui-gradient-success-start)/0.12)]
        oui-p-3
      "
    >
      <Text className="oui-text-base-contrast-98 oui-text-base oui-font-semibold">
        {t("affiliate.trader")}
      </Text>
      <Text className="oui-text-sm oui-font-normal oui-text-base-contrast-54">
        {t("affiliate.commission.30d")}
      </Text>
      <Flex
        className={cn(
          "oui-mt-auto oui-w-full oui-flex-row oui-items-center oui-gap-1",
        )}
      >
        <img
          src="https://oss.orderly.network/static/symbol_logo/USDC.png"
          alt="USDC"
          className="oui-size-5"
        />
        <Text className="oui-text-base-contrast-98 oui-text-xs oui-font-semibold">
          {commifyOptional(
            props?.referralInfo?.referee_info["30d_referee_rebate"],
            { fix: 2, fallback: "--" },
          )}
        </Text>
        <ChevronRightIcon
          size={18}
          color="white"
          className="oui-ml-auto"
          onClick={() =>
            props?.routerAdapter?.onRouteChange({
              href: "/rewards/affiliate",
              name: t("tradingRewards.rewards"),
            })
          }
        />
      </Flex>
      <Flex className="oui-absolute oui-right-3 oui-top-3">
        <TraderMobileIcon />
      </Flex>
    </Flex>
  );
};
