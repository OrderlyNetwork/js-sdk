import { FC } from "react";
import { Flex, Text, TraderMobileIcon, ChevronRightIcon, cn } from "@orderly.network/ui";

export const TraderCardMobile: FC = () => {
  return (
    <Flex 
      className="
        oui-h-[112px] 
        oui-w-full 
        oui-items-start 
        oui-flex-col 
        oui-p-3 
        oui-rounded-xl 
        oui-bg-gradient-to-r 
        oui-from-[rgba(var(--oui-gradient-success-end)/0.12)] 
        oui-via-21.6%
        oui-to-[rgba(var(--oui-gradient-success-start)/0.12)] 
        oui-via-83.23%
        oui-relative
        oui-border
        oui-border-solid
        oui-border-[rgba(var(--oui-gradient-success-end)/0.54)]
      "
    >
      <Text className="oui-text-base-contrast-98 oui-text-base oui-font-semibold">
        Trader
      </Text>
      <Text className="oui-text-base-contrast-54 oui-text-sm oui-font-normal">
        30d commission
      </Text>
      <Flex className={cn("oui-w-full oui-flex-row oui-items-center oui-gap-1 oui-mt-auto")}>
        <img 
          src="https://oss.orderly.network/static/symbol_logo/USDC.png" 
          alt="USDC" 
          className="oui-w-5 oui-h-5"
        />
        <Text className="oui-text-base-contrast-98 oui-text-xs oui-font-semibold">
          --
        </Text>
        <ChevronRightIcon size={18} color="white" className="oui-ml-auto"/>
      </Flex>
      <Flex className="oui-absolute oui-top-3 oui-right-3">
        <TraderMobileIcon />
      </Flex>
    </Flex>
  );
};

