import { FC } from "react";
import { isNumber } from "lodash";
import { RefferalAPI as API } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  Flex,
  Text,
  AffiliateIcon,
  ChevronRightIcon,
  cn,
} from "@orderly.network/ui";
import { RouterAdapter } from "@orderly.network/ui-scaffold";
import { commifyOptional } from "@orderly.network/utils";

type AffiliateCardMobileProps = {
  referralInfo?: API.ReferralInfo;
  routerAdapter?: RouterAdapter;
};

export const AffiliateCardMobile: FC<AffiliateCardMobileProps> = (props) => {
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
        oui-border-[rgba(var(--oui-gradient-primary-start)/0.36)] 
        oui-bg-gradient-to-r
        oui-from-[rgba(var(--oui-gradient-primary-end)/0.12)]
        oui-to-[rgba(var(--oui-gradient-primary-start)/0.12)]
        oui-p-3
      "
    >
      <Flex className="oui-w-full oui-flex-row oui-justify-between oui-items-center">
        <Flex className="oui-flex-col oui-items-start">
          <Text className="oui-text-base-contrast oui-text-base oui-font-semibold">
            {t("common.affiliate")}
          </Text>
          <Text className="oui-text-2xs oui-font-normal oui-text-base-contrast-54">
            {t("affiliate.commission.30d")}
          </Text>
        </Flex>
        {/* <TraderMobileIcon /> */}
        <AffiliateIcon />
      </Flex>
      <Flex className="oui-mt-auto oui-w-full oui-flex-row oui-items-center oui-gap-1">
        <img
          src="https://oss.orderly.network/static/symbol_logo/USDC.png"
          alt="USDC"
          className="oui-size-5"
        />
        <Text
          className={cn(
            "oui-text-xs oui-font-semibold",
            isNumber(props?.referralInfo?.referrer_info["30d_referrer_rebate"])
              ? "oui-text-base-contrast"
              : "oui-text-base-contrast-36",
          )}
        >
          {commifyOptional(
            props?.referralInfo?.referrer_info["30d_referrer_rebate"],
            { fix: 2, fallback: "--" },
          )}
        </Text>
        <ChevronRightIcon
          size={18}
          color="white"
          className="oui-ml-auto"
          onClick={() =>
            props?.routerAdapter?.onRouteChange({
              href: "/rewards/affiliate?tab=affiliate",
              name: t("tradingRewards.rewards"),
            })
          }
        />
      </Flex>
    </Flex>
  );
};
