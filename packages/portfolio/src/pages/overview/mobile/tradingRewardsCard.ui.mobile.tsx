import { FC, useState, useEffect } from "react";
import { Flex, Text, TradingRewardsIcon, ChevronRightIcon } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

export const TradingRewardsCardMobile: FC = () => {
  const { t } = useTranslation();

  return (
    <Flex 
      className="
        oui-h-[236px] 
        oui-w-full 
        oui-items-start 
        oui-flex-col 
        oui-p-3 
        oui-rounded-xl 
        oui-bg-gradient-to-r
        oui-from-[rgba(var(--oui-gradient-secondary-end)/0.12)] 
        oui-via-21.6% 
        oui-to-[rgba(var(--oui-gradient-secondary-start)/0.12)] 
        oui-via-83.23% 
        oui-relative
        oui-border
        oui-border-solid
        oui-border-[rgba(var(--oui-gradient-secondary-end)/0.54)]
      "
    >
      <Text className="oui-text-base-contrast-98 oui-text-base oui-font-semibold">
       {t("common.tradingRewards")}
      </Text>
      <Text className="oui-text-base-contrast-54 oui-text-sm oui-font-normal">
        {t("tradingRewards.myEstRewards")}
      </Text>
      <Flex direction="row" itemAlign={"center"} className="oui-w-full oui-justify-center oui-gap-1.5 oui-mt-[35px] oui-mb-3">
        <Text className="oui-text-base-contrast-80 oui-text-sm oui-font-normal">{t("tradingRewards.epoch")}</Text>
        <Text className="oui-text-base-contrast-98 oui-text-sm oui-font-bold">18</Text>
      </Flex>
      <Countdown targetTimestamp={1719811200} />
      <Flex className="oui-w-full oui-flex-row oui-items-center oui-gap-1 oui-mt-auto">
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
        <TradingRewardsIcon />
      </Flex>
    </Flex>
  );
};

const Countdown: FC<{
  targetTimestamp?: number;
}> = ({ targetTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof targetTimestamp === "undefined") return;
      const now = new Date().getTime();
      const distance = targetTimestamp - now;

      if (distance < 0) {
        clearInterval(intervalId as unknown as number);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(intervalId as unknown as number);
  }, [targetTimestamp]);

  return <Flex direction="row" itemAlign={"center"} gap={3} className="oui-w-full oui-justify-center">
    <CountDownItem type="D" value={timeLeft.days} />
    <CountDownItem type="H" value={timeLeft.hours} />
    <CountDownItem type="M" value={timeLeft.minutes} />
    <CountDownItem type="S" value={timeLeft.seconds} />
  </Flex>;
};

const CountDownItem = ({ type, value }: { type: string, value: number }) => {
  return (
    <Flex direction="column" itemAlign={"center"} className="oui-w-8 oui-h-11 oui-bg-base-8 oui-rounded-[6px]">
      <Text className="oui-text-base-contrast-98 oui-text-base oui-font-bold">
        {value}
      </Text>
      <Text className="oui-text-base-contrast-36 oui-text-2xs oui-font-normal">
        {type}
      </Text>
    </Flex>
  );
};

