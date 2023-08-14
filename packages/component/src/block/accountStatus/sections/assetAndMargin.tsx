import Button from "@/button";
import { Divider } from "@/divider";
import { NetworkImage } from "@/icon/networkImage";
import { Paper } from "@/layout";
import { RiskIndicator } from "@/riskIndicator";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { FC } from "react";

export interface AssetAndMarginProps {
  onDeposit?: () => Promise<void>;
  onWithdraw?: () => Promise<void>;
}

export const AssetAndMarginSheet: FC<AssetAndMarginProps> = (props) => {
  return (
    <div>
      <div>
        <Statistic label="Total Value" value="166,983.23" />
      </div>
      <div className="grid grid-cols-2">
        <Statistic label="Unreal.PnL(USDC)" value="166,983.23" coloring />
        <Statistic label="Unreal.PnL(USDC)" value="166,983.23" coloring />
      </div>
      <Divider />
      <div className="grid grid-cols-2">
        <Statistic
          label="Margin Ratio"
          value={
            <div className="flex items-center gap-2">
              <div className="text-primary">123.45%</div>

              <RiskIndicator height={24} />
            </div>
          }
        />
        <Statistic label="Free / Total Collateral(USDC)" value="166,983.23" />
      </div>
      <Divider />
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
      <Paper className="bg-slate-600/20">
        <div className="flex justify-between text-sm">
          <span>Instrument</span>
          <span>Available Balance</span>
        </div>
        <Divider />
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <NetworkImage name={"USDC"} type={"coin"} />
            <span>USDC</span>
          </div>
          <div>123,456</div>
        </div>
      </Paper>
      <div className="flex gap-2 py-5">
        <Button fullWidth>Deposit</Button>
        <Button fullWidth variant={"outlined"}>
          Withdraw
        </Button>
      </div>
    </div>
  );
};
