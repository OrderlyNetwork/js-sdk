import React, { FC } from "react";
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
import { useCollateral, usePositionStream } from "@orderly.network/hooks";

export interface AssetAndMarginProps {
  onDeposit?: () => Promise<void>;
  onWithdraw?: () => Promise<void>;
}

export const AssetAndMarginSheet: FC<AssetAndMarginProps> = (props) => {
  const { totalCollateral, freeCollateral, totalValue } = useCollateral();
  const [{ aggregated }] = usePositionStream();
  return (
    <StatisticStyleProvider labelClassName="text-sm text-base-contrast/30">
      <div className="pt-3">
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
              <div className="text-primary">123.45%</div>

              <RiskIndicator height={24} />
            </div>
          }
        />
        <Statistic
          label="Free / Total Collateral(USDC)"
          value={`${freeCollateral} / ${totalCollateral}`}
        />
      </div>

      <div>
        <Statistic
          label="Max Account Leverage"
          value={
            <div className="py-4">
              <Slider />
            </div>
          }
        />
      </div>
      <Divider className="py-4" />
      <Paper className="bg-slate-600/20">
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
          <Numeral>123456</Numeral>
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
