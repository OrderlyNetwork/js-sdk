import { FC, useState, useEffect } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Flex,
  Text,
  TradingRewardsIcon,
  ChevronRightIcon,
  OrderlyIcon,
  EsOrderlyIcon,
  cn,
  modal,
} from "@orderly.network/ui";
import { UseRewardsDataReturn } from "./useRewardsData.script";

type TradingRewardsCardMobileProps = UseRewardsDataReturn & {
  isSignIn: boolean;
  wrongNetwork: boolean;
};

export const TradingRewardsCardMobile: FC<TradingRewardsCardMobileProps> = (
  props,
) => {
  const { t } = useTranslation();

  const curEpochInfo = props.epochList?.[1].curEpochInfo;
  // const startTime = curEpochInfo?.start_time;
  const endTime = curEpochInfo?.end_time;
  const curEpochId = curEpochInfo?.epoch_id;
  // const max_reward_amount = curEpochInfo?.max_reward_amount;

  const isOrder = curEpochInfo
    ? `${curEpochInfo?.epoch_token}`.toLowerCase() === "order"
    : undefined;

  const onClaim = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!props.isSignIn || props.wrongNetwork) {
      event.stopPropagation();
      event.preventDefault();
      modal.alert({
        title: t("common.tips"),
        message: (
          <Text intensity={54}>
            {props.wrongNetwork
              ? t("connector.wrongNetwork.tooltip")
              : t("affiliate.connectWallet.tooltip")}
          </Text>
        ),
      });
    }
  };

  return (
    <Flex
      className="
        oui-via-21.6% 
        oui-via-83.23% 
        oui-relative 
        oui-h-[236px] 
        oui-w-full 
        oui-flex-col 
        oui-items-start
        oui-rounded-xl 
        oui-border 
        oui-border-solid 
        oui-border-[rgba(var(--oui-gradient-secondary-end)/0.54)] 
        oui-bg-gradient-to-r
        oui-from-[rgba(var(--oui-gradient-secondary-end)/0.12)]
        oui-to-[rgba(var(--oui-gradient-secondary-start)/0.12)]
        oui-p-3
      "
    >
      <Text className="oui-text-base-contrast-98 oui-text-base oui-font-semibold">
        {t("common.tradingRewards")}
      </Text>
      <Text className="oui-text-sm oui-font-normal oui-text-base-contrast-54">
        {t("tradingRewards.myEstRewards")}
      </Text>
      <Flex
        direction="row"
        itemAlign={"center"}
        className="oui-mb-3 oui-mt-[35px] oui-w-full oui-justify-center oui-gap-1.5"
      >
        <Text className="oui-text-sm oui-font-normal oui-text-base-contrast-80">
          {t("tradingRewards.epoch")}
        </Text>
        <Text className="oui-text-base-contrast-98 oui-text-sm oui-font-bold">
          {curEpochId}
        </Text>
      </Flex>
      <Countdown targetTimestamp={endTime} />
      <Flex className="oui-mt-auto oui-w-full oui-flex-row oui-items-center oui-gap-1">
        {isOrder ? (
          <OrderlyIcon className="oui-size-5" />
        ) : (
          <EsOrderlyIcon className="oui-size-5" />
        )}
        <Text className="oui-text-base-contrast-98 oui-text-xs oui-font-semibold">
          {props?.curEpochEstimate?.est_r_wallet ?? "--"}
        </Text>
        <Flex className="oui-ml-auto">
          <Text
            className={cn(
              props?.curEpochEstimate?.est_r_wallet
                ? "oui-text-2xs oui-font-semibold oui-text-[#BD6BED]"
                : "oui-hidden",
            )}
          >
            {t("tradingRewards.claim")}
          </Text>
          <ChevronRightIcon
            size={18}
            color="white"
            className="oui-ml-auto"
            onClick={onClaim}
          />
        </Flex>
      </Flex>
      <Flex className="oui-absolute oui-right-3 oui-top-3">
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
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(intervalId as unknown as number);
  }, [targetTimestamp]);

  return (
    <Flex
      direction="row"
      itemAlign={"center"}
      gap={3}
      className="oui-w-full oui-justify-center"
    >
      <CountDownItem type="D" value={timeLeft.days} />
      <CountDownItem type="H" value={timeLeft.hours} />
      <CountDownItem type="M" value={timeLeft.minutes} />
      <CountDownItem type="S" value={timeLeft.seconds} />
    </Flex>
  );
};

const CountDownItem = ({ type, value }: { type: string; value: number }) => {
  return (
    <Flex
      direction="column"
      itemAlign={"center"}
      className="oui-h-11 oui-w-8 oui-rounded-[6px] oui-bg-base-8"
    >
      <Text className="oui-text-base-contrast-98 oui-text-base oui-font-bold">
        {value}
      </Text>
      <Text className="oui-text-2xs oui-font-normal oui-text-base-contrast-36">
        {type}
      </Text>
    </Flex>
  );
};
