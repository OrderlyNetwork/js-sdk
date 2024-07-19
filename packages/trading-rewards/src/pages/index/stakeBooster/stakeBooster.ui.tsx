import { Flex, Text } from "@orderly.network/ui";
import { JumpIcon } from "../components/jumpIcon";
import { FC, ReactNode, useMemo } from "react";
import { EsOrderlyIcon } from "../components/esOrderlyIcon";
import { OrderlyIcon } from "../components/orderlyIcon";
import { RocketIcon } from "../components/rocket";
import { StakeBoosterReturns } from "./stakeBooster.script";
import { Decimal, commify, commifyOptional } from "@orderly.network/utils";

export const StakeBoosterUI: FC<StakeBoosterReturns> = (props) => {
  const booster = useMemo(() => {
    const estStakeBoost = props.curEpochEstimate?.est_stake_boost;
    if (typeof estStakeBoost === "undefined" || estStakeBoost === null) {
      return undefined;
    }

    if (estStakeBoost === 0) return estStakeBoost;

    return new Decimal(estStakeBoost)
      .div(new Decimal(10).pow(0.2))
      .toDecimalPlaces(2, Decimal.ROUND_DOWN)
      .toString();
  }, [props.curEpochEstimate?.est_stake_boost]);

  return (
    <Flex
      p={6}
      r="2xl"
      direction={"column"}
      gap={4}
      width={"100%"}
      className=" oui-font-semibold oui-bg-base-9 "
    >
      <Flex direction={"row"} justify={"between"} width={"100%"}>
        <Text className="oui-text-lg">Stake booster</Text>
        <Flex
          direction={"row"}
          gap={1}
          onClick={props.stakeNow}
          className="oui-cursor-pointer"
        >
          <Text color="primary" size="sm">
            Stake
          </Text>
          <JumpIcon />
        </Flex>
      </Flex>
      <Flex direction={"row"} gap={3} width={"100%"}>
        <Statics
          title="Avg. staked amount"
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
          title="Booster"
          value={booster}
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
      r="2xl"
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
            {calcValue + (calcValue === '--' ? '' : 'x')}
          </Text.gradient>
        ) : (
          <Text
            className="oui-text-sm xl:oui-text-base"
          >
            {commifyOptional(props.value)}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
