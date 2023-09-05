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
import { EyeOff } from "lucide-react";
import {
  useCollateral,
  usePositionStream,
  useMarginRatio,
} from "@orderly.network/hooks";

export interface AssetAndMarginProps {
  onDeposit?: () => Promise<void>;
  onWithdraw?: () => Promise<void>;
}

export const AssetAndMarginSheet: FC<AssetAndMarginProps> = (props) => {
  const { totalCollateral, freeCollateral, totalValue } = useCollateral({
    dp: 2,
  });
  const [{ aggregated }] = usePositionStream();
  const marginRatio = useMarginRatio();

  return (
    <StatisticStyleProvider labelClassName="text-sm text-base-contrast/30">
      <div className="pt-5">
        <Statistic
          label={
            <div className="flex gap-2 text-base items-center">
              <span>Total Value</span>
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
          value={aggregated.unsettledPnL}
          rule="price"
          coloring
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
              <span>Current:0.00x</span>
            </div>
          }
          value={
            <div className="py-1">
              <Slider />
            </div>
          }
        />
      </div>
      <Divider className="py-4" />
      <Paper className="bg-base-100">
        <div className="flex justify-between text-sm text-base-contrast">
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
        <Button fullWidth>Deposit</Button>
        <Button fullWidth variant={"outlined"}>
          Withdraw
        </Button>
      </div>
    </StatisticStyleProvider>
  );
};
