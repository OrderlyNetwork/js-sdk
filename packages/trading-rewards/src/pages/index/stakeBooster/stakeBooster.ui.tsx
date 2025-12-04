import { FC, ReactNode } from "react";
import { Flex, Text } from "@veltodefi/ui";
import { JumpIcon } from "../components/jumpIcon";
import { EsOrderlyIcon } from "../components/esOrderlyIcon";
import { OrderlyIcon } from "../components/orderlyIcon";
import { RocketIcon } from "../components/rocket";
import { StakeBoosterReturns } from "./stakeBooster.script";
import { commify, commifyOptional } from "@veltodefi/utils";
import { useTranslation } from "@veltodefi/i18n";

export const StakeBooster: FC<StakeBoosterReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex
      id="oui-tradingRewards-home-stakeBooster"
      p={6}
      r="2xl"
      direction={"column"}
      gap={4}
      width={"100%"}
      className=" oui-font-semibold oui-bg-base-9 "
    >
      <Flex direction={"row"} justify={"between"} width={"100%"}>
        <Text className="oui-text-lg">{t("tradingRewards.stakeBooster")}</Text>
        <Flex
          direction={"row"}
          gap={1}
          onClick={props.stakeNow}
          className="oui-cursor-pointer oui-text-primary-light"
        >
          <Text size="sm">{t("tradingRewards.stake")}</Text>
          <JumpIcon />
        </Flex>
      </Flex>
      <Flex direction={"row"} gap={3} width={"100%"}>
        <Statics
          title={t("tradingRewards.avgStakedAmount")}
          value={props.curEpochEstimate?.est_avg_stake}
          icon={
            <div className="oui-flex oui-w-[32px] oui-h-[20px] oui-relative">
              <div className="oui-absolute oui-right-0 oui-top-0">
                <EsOrderlyIcon />
              </div>
              <div className="oui-absolute oui-left-0 oui-top-0 ">
                <OrderlyIcon />
              </div>
            </div>
          }
        />
        <Statics
          title={t("tradingRewards.booster")}
          value={props.booster}
          icon={<RocketIcon />}
          gradient
        />
      </Flex>
    </Flex>
  );
};

const Statics: FC<{
  title: string;
  icon: ReactNode;
  value?: number | string;
  gradient?: boolean;
}> = (props) => {
  const calcValue = commify(props.value || "--", 2);
  return (
    <Flex
      className="oui-flex-1 oui-bg-base-8 oui-py-[11px]"
      direction={"column"}
      gap={2}
      r="xl"
      gradient="neutral"
      angle={180}
      border
      borderColor={6}
    >
      <Text className="oui-text-xs xl:oui-text-sm oui-text-base-contrast-54">
        {props.title}
      </Text>
      <Flex direction={"row"} gap={1}>
        {props.icon}
        {props.gradient ? (
          <Text.gradient
            className="oui-text-sm xl:oui-text-base"
            color="brand"
            angle={90}
          >
            {calcValue + (calcValue === "--" ? "" : "x")}
          </Text.gradient>
        ) : (
          <Text className="oui-text-sm xl:oui-text-base">
            {commifyOptional(props.value, { fix: 2 })}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
