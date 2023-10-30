import React, { FC, useCallback, useContext, useMemo } from "react";
import Button from "@/button";
import { Divider } from "@/divider";
import { NetworkImage } from "@/icon/networkImage";
import { Paper } from "@/layout";
import { RiskIndicator } from "@/riskIndicator";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { Numeral } from "@/text";
import { RotateCw } from "lucide-react";
import {
  useCollateral,
  usePositionStream,
  useMarginRatio,
  useLeverage,
} from "@orderly.network/hooks";

// import Slider from "rc-slider";
import { modal } from "@/modal";
import { toast } from "@/toast";
import { AssetsContext } from "@/provider/assetsProvider";
import { EyeIcon, EyeOffIcon } from "@/icon";
import { cn } from "@/utils/css";
import { cx } from "class-variance-authority";

export interface AssetAndMarginProps {
  onDeposit?: () => Promise<void>;
  onWithdraw?: () => Promise<void>;
  onSettle?: () => Promise<void>;
  onLeverageChange?: (value: number) => void;

  maxLeverage?: number | string;
}

const leverageLevers = [1, 2, 3, 4, 5, 10];

export const AssetAndMarginSheet: FC<AssetAndMarginProps> = (props) => {
  const { totalCollateral, freeCollateral, totalValue, availableBalance } =
    useCollateral({
      dp: 2,
    });
  const [{ aggregated, totalUnrealizedROI }, positionsInfo] =
    usePositionStream();
  const { marginRatio, currentLeverage } = useMarginRatio();
  const { visible, toggleVisible, onDeposit, onWithdraw } =
    useContext(AssetsContext);

  const [maxLeverage, { update }] = useLeverage();

  const [leverage, setLeverage] = React.useState(() => maxLeverage ?? 0);

  const leverageValue = useMemo(() => {
    const index = leverageLevers.findIndex((item) => item === leverage);

    return index;
  }, [leverage]);

  const onUnsettleClick = useCallback(() => {
    return modal.confirm({
      title: "Settle PnL",
      content: (
        <div className="text-base-contrast/60">
          Are you sure you want to settle your PnL?
        </div>
      ),
      onCancel: () => {
        return Promise.reject();
      },
      onOk: () => {
        if (typeof props.onSettle !== "function") return Promise.resolve();
        return props.onSettle().then(() => {
          toast.success("PnL settled");
        });
      },
    });
  }, []);

  const marginRatioVal = useMemo(() => {
    return Math.min(
      10,
      aggregated.notional === 0
        ? positionsInfo["margin_ratio"](10)
        : marginRatio
    );
  }, [marginRatio, aggregated]);

  // console.log("marginRatio", marginRatio, marginRatioVal);

  return (
    <StatisticStyleProvider labelClassName="text-sm text-base-contrast/30">
      <div className="pt-5">
        <Statistic
          label={
            <div className="flex text-base items-center">
              <span>Total value (USDC)</span>
              <button
                className="text-primary-light p-2"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleVisible();
                }}
              >
                {visible ? (
                  <EyeOffIcon className="text-primary" size={14} />
                ) : (
                  <EyeIcon className="text-primary" size={14} />
                )}
              </button>
            </div>
          }
          value={totalValue}
          rule="price"
          visible={visible}
        />
      </div>
      <div className="grid grid-cols-2 py-4">
        <Statistic
          label="Unreal.PnL(USDC)"
          value={
            <div className="flex gap-1 items-center">
              <Numeral coloring visible={visible}>
                {aggregated.unrealPnL}
              </Numeral>

              <Numeral
                visible={visible}
                rule="percentages"
                coloring
                surfix=")"
                prefix="("
                className="text-sm opacity-60"
              >
                {totalUnrealizedROI}
              </Numeral>
            </div>
          }
          rule="price"
          coloring
        />
        <Statistic
          label="Unsettled PnL(USDC)"
          value={
            <div className="flex justify-between">
              <Numeral rule="price" visible={visible} coloring>
                {aggregated.unsettledPnL}
              </Numeral>
              <button
                className="text-primary-light text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onUnsettleClick}
                disabled={aggregated.unsettledPnL === 0}
              >
                <RotateCw size={14} />
                <span>Settle PnL</span>
              </button>
            </div>
          }
        />
      </div>
      <Divider />
      <div className="grid grid-cols-2 py-4">
        <Statistic
          label="Margin ratio"
          value={
            <div className="flex items-center gap-2">
              <Numeral
                rule="percentages"
                className={cx({
                  "text-primary-light": marginRatioVal >= 10,
                  "text-warning": marginRatioVal < 10 && marginRatioVal >= 0.5,
                  "text-danger": marginRatioVal < 0.5,
                })}
                visible={visible}
              >
                {marginRatioVal}
              </Numeral>

              <RiskIndicator value={marginRatioVal} />
            </div>
          }
        />
        <Statistic
          label="Free / Total collateral(USDC)"
          value={
            <div className="flex gap-1">
              <Numeral visible={visible}>{freeCollateral}</Numeral>
              <span>/</span>
              <Numeral visible={visible}>{totalCollateral}</Numeral>
            </div>
          }
        />
      </div>

      <div>
        <Statistic
          label={
            <div className="flex justify-between">
              <span>Max account leverage</span>
              <span className="flex">
                Current:
                <Numeral className="text-base-contrast ml-1" surfix="x">
                  {currentLeverage}
                </Numeral>
              </span>
            </div>
          }
          value={
            <div className="h-[40px] mt-2 mx-2">
              <Slider
                min={0}
                max={5}
                color={"primary-light"}
                markLabelVisible
                value={[leverageValue]}
                showTip={false}
                // markCount={5}
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
                  const _value = leverageLevers[value[0]];
                  setLeverage(_value);
                }}
                onValueCommit={(value) => {
                  const _value = leverageLevers[value[0]];
                  setLeverage(_value);
                  update({ leverage: _value }).then(
                    (res: any) => {
                      // console.log("res", res);
                      toast.success("Leverage updated");
                    },
                    (err: Error) => {
                      // console.log("err", err);
                      toast.error(err.message);
                      setLeverage(maxLeverage ?? 1);
                    }
                  );
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
          <span>Available balance</span>
        </div>
        <Divider className="py-3" />
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <NetworkImage name={"USDC"} type={"token"} size={"small"} />
            <span>USDC</span>
          </div>
          <Numeral precision={2} visible={visible}>
            {availableBalance}
          </Numeral>
        </div>
      </Paper>
      <div className="flex gap-3 py-5">
        <Button fullWidth onClick={onDeposit}>
          Deposit
        </Button>
        <Button fullWidth variant={"outlined"} onClick={onWithdraw}>
          Withdraw
        </Button>
      </div>
    </StatisticStyleProvider>
  );
};
