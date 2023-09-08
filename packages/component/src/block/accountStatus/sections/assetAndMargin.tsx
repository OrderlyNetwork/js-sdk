import React, { FC, useMemo } from "react";
import Button from "@/button";
import { Divider } from "@/divider";
import { NetworkImage } from "@/icon/networkImage";
import { Paper } from "@/layout";
import { RiskIndicator } from "@/riskIndicator";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { Numeral } from "@/text";
import { EyeOff, RotateCw } from "lucide-react";
import {
  useCollateral,
  usePositionStream,
  useMarginRatio,
  useLeverage,
} from "@orderly.network/hooks";

export interface AssetAndMarginProps {
  onDeposit?: () => Promise<void>;
  onWithdraw?: () => Promise<void>;
  onLeverageChange?: (value: number) => void;
}

const leverageLevers = [1, 2, 3, 4, 5, 10];

export const AssetAndMarginSheet: FC<AssetAndMarginProps> = (props) => {
  const { totalCollateral, freeCollateral, totalValue } = useCollateral({
    dp: 2,
  });
  const [{ aggregated }] = usePositionStream();
  const marginRatio = useMarginRatio();

  // const [leverage, { update }] = useLeverage();

  // console.log("leverage", leverage);

  // const marginRatio = 0.5;

  // const { onDeposit, onWithdraw } = props;

  // const currentLeverage = useMemo(() => {
  //   const d = 1 / marginRatio;

  //   console.log("marginRatio", marginRatio, d);
  // }, [marginRatio]);

  return (
    <StatisticStyleProvider labelClassName="text-sm text-base-contrast/30">
      <div className="pt-5">
        <Statistic
          label={
            <div className="flex gap-2 text-base items-center">
              <span>Total Value (USDC)</span>
              <EyeOff className="text-primary" size={14} />
            </div>
          }
          value={totalValue}
          rule="price"
        />
      </div>
      <div className="grid grid-cols-2 py-4">
        <Statistic
          label="Unreal.PnL(USDC)"
          value={aggregated.unrealPnL}
          rule="price"
          coloring
        />
        <Statistic
          label="Unsettled PnL(USDC)"
          value={
            <div className="flex justify-between">
              <Numeral rule="price" coloring>
                {aggregated.unsettledPnL}
              </Numeral>
              <button className="text-primary text-sm flex items-center gap-2">
                <RotateCw size={16} />
                <span>Settle PnL</span>
              </button>
            </div>
          }
        />
      </div>
      <Divider />
      <div className="grid grid-cols-2 py-4">
        <Statistic
          label="Margin Ratio"
          value={
            <div className="flex items-center gap-2">
              <Numeral rule="percentages" className="text-primary">
                {marginRatio}
              </Numeral>

              <RiskIndicator height={24} />
            </div>
          }
        />
        <Statistic
          label="Free / Total Collateral(USDC)"
          value={
            <div>
              <Numeral>{freeCollateral}</Numeral> /{" "}
              <Numeral>{totalCollateral}</Numeral>
            </div>
          }
        />
      </div>

      <div>
        <Statistic
          label={
            <div className="flex justify-between">
              <span>Max Account Leverage</span>
              <span>
                Current:
                <span className="text-base-contrast ml-1">0.00x</span>
              </span>
            </div>
          }
          value={
            <div className="py-1 px-3">
              <Slider
                min={0}
                max={5}
                color={"primary"}
                markLabelVisible
                value={[10]}
                marks={[
                  {
                    value: 0,
                    label: "1x",
                  },
                  {
                    value: 1,
                    label: "2x",
                  },
                  {
                    value: 2,
                    label: "3x",
                  },
                  {
                    value: 3,
                    label: "4x",
                  },
                  {
                    value: 4,
                    label: "5x",
                  },
                  {
                    value: 5,
                    label: "10x",
                  },
                ]}
                onValueChange={(value) => {
                  // console.log("value", value);
                  // props.onLeverageChange?.(leverageLevers[value[0]]);
                  // update({ leverage: leverageLevers[value[0]] });
                }}
              />
            </div>
          }
        />
      </div>
      <Divider className="py-4" />
      <Paper className="bg-base-100">
        <div className="flex justify-between text-sm text-base-contrast/50">
          <span>Instrument</span>
          <span>Available Balance</span>
        </div>
        <Divider className="py-3" />
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <NetworkImage name={"USDC"} type={"coin"} size={"small"} />
            <span>USDC</span>
          </div>
          <Numeral>0</Numeral>
        </div>
      </Paper>
      <div className="flex gap-3 py-5">
        <Button fullWidth onClick={() => {}}>
          Deposit
        </Button>
        <Button fullWidth variant={"outlined"} onClick={() => {}}>
          Withdraw
        </Button>
      </div>
    </StatisticStyleProvider>
  );
};
