import { memo, useCallback, useContext } from "react";
import { Numeral } from "@/text";
import { useCollateral, usePositionStream } from "@orderly.network/hooks";
import { AssetsContext } from "@/provider";
import { modal } from "@orderly.network/ui";
import { SettlePnlContent } from "@/block/withdraw";
import { RefreshCcw } from "lucide-react";

const AssetsDetail = () => {
  const { freeCollateral } = useCollateral({
    dp: 2,
  });

  const [{ aggregated }] = usePositionStream();

  const { onSettle } = useContext(AssetsContext);

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
          return onSettle();
        },
      })
      .then(
        () => {},
        (error) => {}
      );
  }, []);

  return (
    <div
      className={
        "orderly-text-xs orderly-py-4 orderly-mb-4 orderly-border-b orderly-border-t orderly-border-divider orderly-space-y-2 orderly-tabular-nums"
      }
    >
      <div className={"orderly-flex orderly-justify-between"}>
        <span className={"orderly-text-base-contrast-54"}>Free collateral</span>
        <Numeral
          surfix={<span className={"orderly-text-base-contrast-36"}>USDC</span>}
        >
          {freeCollateral}
        </Numeral>
      </div>
      <div className={"orderly-flex orderly-justify-between"}>
        <span className={"orderly-text-base-contrast-54"}>Unsettled PnL</span>
        <Numeral
          coloring
          prefix={
            <button
              className={"orderly-text-primary-light"}
              onClick={onSettleClick}
            >
              {/*@ts-ignore*/}
              <RefreshCcw size={14} />
            </button>
          }
          surfix={<span className={"orderly-text-base-contrast-36"}>USDC</span>}
        >
          {aggregated?.unsettledPnL ?? 0}
        </Numeral>
      </div>
    </div>
  );
};

export const MemorizedAssetsDetail = memo(AssetsDetail);
