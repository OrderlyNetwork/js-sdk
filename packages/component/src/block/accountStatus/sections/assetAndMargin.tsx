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
import { modal } from "@orderly.network/ui";
import { toast } from "@/toast";
import { AssetsContext } from "@/provider/assetsProvider";
import { EyeIcon, EyeOffIcon } from "@/icon";
import { cn } from "@/utils/css";
import { cx } from "class-variance-authority";
import { LeverageEditor } from "./leverageEditor";
import { getMarginRatioColor } from "../utils";

export interface AssetAndMarginProps {
  onDeposit?: () => Promise<void>;
  onWithdraw?: () => Promise<void>;
  onSettle?: () => Promise<void>;
  onLeverageChange?: (value: number) => void;

  maxLeverage?: number | string;
}

// const leverageLevers = [1, 2, 3, 4, 5, 10];

export const AssetAndMarginSheet: FC<AssetAndMarginProps> = (props) => {
  const { totalCollateral, freeCollateral, totalValue, availableBalance } =
    useCollateral({
      dp: 2,
    });
  const [{ aggregated, totalUnrealizedROI }, positionsInfo] =
    usePositionStream();
  const { marginRatio, currentLeverage, mmr } = useMarginRatio();
  const { visible, toggleVisible, onDeposit, onWithdraw } =
    useContext(AssetsContext);

  const [maxLeverage, { update, config: leverageLevers }] = useLeverage();

  // console.log("leverageLevers", leverageLevers);

  // const [leverage, setLeverage] = React.useState(() => maxLeverage ?? 0);

  // const leverageValue = useMemo(() => {
  //   const index = leverageLevers.findIndex((item) => item === leverage);

  //   return index;
  // }, [leverage, leverageLevers]);

  const onUnsettleClick = useCallback(() => {
    return modal.confirm({
      title: "Settle PnL",
      // maxWidth: "xs",
      content: (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          Are you sure you want to settle your PnL? Settlement will take up to 1
          minute before you can withdraw your available balance.
        </div>
      ),
      onCancel: () => {
        return Promise.reject();
      },
      onOk: () => {
        if (typeof props.onSettle !== "function") return Promise.resolve();
        return props.onSettle().catch((e) => {});
      },
    });
  }, []);

  const marginRatioVal = useMemo(() => {
    return Math.min(
      10,
      aggregated.notional === 0
        ? // @ts-ignore
          positionsInfo["margin_ratio"](10)
        : marginRatio
    );
  }, [marginRatio, aggregated]);

  const { isRed, isYellow, isGreen } = getMarginRatioColor(marginRatioVal, mmr);

  return (
    <div id="orderly-asset-and-margin-sheet-content">
      <StatisticStyleProvider labelClassName="orderly-text-4xs orderly-text-base-contrast/30">
        <div className="orderly-pt-5">
          <Statistic
            label={
              <div className="orderly-flex orderly-items-center orderly-text-2xs orderly-text-base-contrast-54">
                <span>Total value (USDC)</span>
                <button
                  className="orderly-text-link orderly-p-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleVisible();
                  }}
                >
                  {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            }
            value={totalValue}
            rule="price"
            visible={visible}
          />
        </div>
        <div className="orderly-grid orderly-grid-cols-2 orderly-py-4">
          <Statistic
            label="Unreal. PnL(USDC)"
            labelClassName="orderly-text-base-contrast-36"
            value={
              <div className="orderly-flex orderly-gap-1 orderly-items-center orderly-text-2xs">
                <Numeral coloring visible={visible}>
                  {aggregated.unrealPnL}
                </Numeral>

                <Numeral
                  visible={visible}
                  rule="percentages"
                  coloring
                  surfix=")"
                  prefix="("
                  className="orderly-text-4xs orderly-opacity-60"
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
            labelClassName="orderly-text-base-contrast-36"
            value={
              <div className="orderly-flex orderly-justify-between">
                <Numeral
                  rule="price"
                  visible={visible}
                  coloring
                  className="orderly-text-2xs"
                >
                  {aggregated.unsettledPnL}
                </Numeral>
                <button
                  className="orderly-text-link orderly-text-3xs orderly-flex orderly-items-center orderly-gap-1 disabled:orderly-opacity-50 disabled:orderly-cursor-not-allowed"
                  onClick={onUnsettleClick}
                  disabled={aggregated.unsettledPnL === 0}
                >
                  {/* @ts-ignore */}
                  <RotateCw size={14} />
                  <span>Settle PnL</span>
                </button>
              </div>
            }
          />
        </div>
        <Divider />
        <div className="orderly-grid orderly-grid-cols-2 orderly-py-4">
          <Statistic
            label="Margin ratio"
            labelClassName="orderly-text-base-contrast-36"
            value={
              <div className="orderly-flex orderly-items-center orderly-gap-2 orderly-text-2xs">
                <Numeral
                  rule="percentages"
                  className={cx({
                    "orderly-text-primary-light": isGreen,
                    "orderly-text-warning": isYellow,
                    "orderly-text-danger": isRed,
                  })}
                  visible={visible}
                >
                  {marginRatioVal}
                </Numeral>

                <RiskIndicator
                  className={cn({
                    "orderly-rotate-0": isGreen,
                    "orderly-rotate-90": isYellow,
                    "orderly-rotate-180": isRed,
                  })}
                />
              </div>
            }
          />
          <Statistic
            label="Free / Total collateral(USDC)"
            labelClassName="orderly-text-base-contrast-36"
            value={
              <div className="orderly-flex orderly-gap-1 orderly-text-2xs">
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
              <div className="orderly-flex orderly-justify-between orderly-text-base-contrast-36">
                <span>Max account leverage</span>
                <span className="orderly-flex">
                  Current:
                  <Numeral
                    className="orderly-text-base-contrast orderly-ml-1"
                    surfix="x"
                  >
                    {currentLeverage ?? '--'}
                  </Numeral>
                </span>
              </div>
            }
            value={
              <div className="orderly-h-[50px] orderly-mt-2 orderly-mx-2 orderly-text-2xs">
                <LeverageEditor
                  leverageLevers={leverageLevers}
                  onSave={(value) => {
                    return update(value).then(
                      (res: any) => {
                        toast.success("Leverage updated");
                        return res;
                      },
                      (err: Error) => {
                        //
                        toast.error(err.message);
                        // setLeverage(maxLeverage ?? 1);
                        throw err;
                      }
                    );
                  }}
                  maxLeverage={maxLeverage}
                />
                {/* <Slider
                min={0}
                max={leverageLevers.length - 1}
                color={"primary"}
                markLabelVisible
                value={[leverageValue]}
                showTip={false}
                // markCount={5}
                marks={leverageLevers.map((item: number) => ({
                  value: item,
                  label: `${item}x`,
                }))}
                onValueChange={(value) => {
                  // console.log("value", value);
                  const _value = leverageLevers[value[0]];
                  setLeverage(_value);
                }}
                onValueCommit={(value) => {
                  const _value = leverageLevers[value[0]];
                  setLeverage(_value);
                  update({ leverage: _value }).then(
                    (res: any) => {
                      //
                      // console.log(res);
                      toast.success("Leverage updated");
                    },
                    (err: Error) => {
                      //
                      toast.error(err.message);
                      setLeverage(maxLeverage ?? 1);
                    }
                  );
                }}
              /> */}
              </div>
            }
          />
        </div>
        <Divider className="orderly-py-4" />
        <Paper className="orderly-bg-base-700">
          <div className="orderly-flex orderly-justify-between orderly-text-4xs orderly-text-base-contrast-36">
            <span>Instrument</span>
            <span>Available balance</span>
          </div>
          <Divider className="orderly-py-3" />
          <div className="orderly-flex orderly-justify-between orderly-text-2xs">
            <div className="orderly-flex orderly-items-center orderly-gap-2">
              <NetworkImage name={"USDC"} type={"token"} size={14} />
              <span>USDC</span>
            </div>
            <Numeral precision={2} visible={visible}>
              {availableBalance}
            </Numeral>
          </div>
        </Paper>
        <div className="orderly-flex orderly-gap-3 orderly-py-5 orderly-text-xs">
          <Button
            fullWidth
            onClick={onDeposit}
            id="orderly-assets-margin-deposit-button"
          >
            Deposit
          </Button>
          <Button
            fullWidth
            variant={"outlined"}
            onClick={onWithdraw}
            id="orderly-assets-margin-withdraw-button"
            className="orderly-border-primary-darken hover:orderly-bg-transport orderly-text-primary"
          >
            Withdraw
          </Button>
        </div>
      </StatisticStyleProvider>
    </div>
  );
};
