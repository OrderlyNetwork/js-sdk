import Button from "@/button";
import { Statistic } from "@/statistic";
import { AggregatedData } from "@/block/positions/overview";
import { FC, useCallback, useContext } from "react";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { Numeral } from "@/text";
import { cn } from "@/utils/css";
import { RefreshCcw } from "lucide-react";
import { Checkbox } from "@/checkbox";
import { Label } from "@/label";
import { AssetsContext, AssetsProvider } from "@/provider/assetsProvider";
import { modal } from "@orderly.network/ui";
import { SettlePnlContent } from "@/block/withdraw";
import { useTabContext } from "@/tab/tabContext";

interface Props {
  onMarketCloseAll?: () => void;
  canCloseAll?: boolean;

  aggregated?: AggregatedData;

  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
  pnlNotionalDecimalPrecision: any;
}

export const Header: FC<Props> = (props) => {
  const unrealPnL = props.aggregated?.unrealPnL ?? 0;
  const { onSettle } = useContext(AssetsContext);
  const { pnlNotionalDecimalPrecision } = props;

  const onSettleClick = useCallback(() => {
    modal
      .confirm({
        title: "Settle PnL",
        content: <SettlePnlContent />,
        // maxWidth: "xs",
        onCancel() {
          return Promise.reject("cancel");
        },
        onOk() {
          return onSettle().catch((e) => {});
        },
      })
      .then(
        () => {},
        (error) => {}
      );
  }, []);

  return (
    <StatisticStyleProvider
      labelClassName="orderly-text-3xs orderly-text-base-contrast-54"
      valueClassName="orderly-text-base-contrast/80 orderly-tabular-nums orderly-font-semibold"
    >
      <div
        className={
          "orderly-flex orderly-justify-between orderly-py-3 orderly-items-center"
        }
      >
        <div className={"orderly-flex orderly-space-x-6"}>
          <Statistic
            label={"Unreal. PnL"}
            value={
              <div
                className={cn("orderly-flex orderly-gap-[0.5]", {
                  "orderly-text-trade-loss": unrealPnL < 0,
                  "orderly-text-trade-profit": unrealPnL > 0,
                })}
              >
                <Numeral precision={pnlNotionalDecimalPrecision}>
                  {unrealPnL}
                </Numeral>
                <Numeral
                  rule="percentages"
                  prefix={"("}
                  surfix={")"}
                  className={"orderly-ml-1 orderly-text-3xs"}
                  precision={pnlNotionalDecimalPrecision}
                >
                  {props.aggregated?.unrealPnlROI ?? 0}
                </Numeral>
              </div>
            }
            rule="price"
            coloring
          />
          {/* <Statistic label={"Daily Real."} value={0} rule="price" coloring /> */}
          <Statistic
            label={"Notional"}
            value={props.aggregated?.notional}
            rule="price"
            precision={pnlNotionalDecimalPrecision}
          />
        </div>
        {/* <div className={"orderly-flex orderly-items-center orderly-gap-2"}>
          <Checkbox
            id={"showCloseTrades"}
          />
          <Label
            htmlFor={"showCloseTrades"}
            className="orderly-text-base-contrast-54 orderly-text-3xs"
          >
            Show close trades
          </Label>
        </div> */}
      </div>
    </StatisticStyleProvider>
  );
};
