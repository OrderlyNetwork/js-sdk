import { memo, useCallback, useContext } from "react";
import { Numeral } from "@/text";
import { useCollateral, usePositionStream } from "@orderly.network/hooks";
import { AssetsContext } from "@/provider";
import { modal } from "@/modal";
import { SettlePnlContent } from "@/block/withdraw";
import { RefreshCcw } from "lucide-react";
import { DesktopFreeCollat } from "@/block/orderEntry/sections/freeCollat";
import { Tooltip } from "@/tooltip";

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
        maxWidth: "xs",
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
    <div
      className={
        "orderly-text-xs orderly-pb-4 orderly-mb-4 orderly-border-b orderly-border-divider orderly-space-y-2 orderly-tabular-nums"
      }
    >
      <div
        className={
          "orderly-flex orderly-justify-between orderly-text-base-contrast-54"
        }
      >
        <DesktopFreeCollat
          title="Free collateral"
          className="orderly-text-xs"
        />
        <Numeral>{freeCollateral}</Numeral>
      </div>
      <div className={"orderly-flex orderly-justify-between"}>
        <Tooltip
          content={
            "Settling PnL moves the profit or loss from a perpetual market into the USDC balance."
          }
          className="orderly-max-w-[270px]"
        >
          <span
            className={"orderly-text-base-contrast-54 orderly-cursor-pointer"}
          >
            Unsettled PnL
          </span>
        </Tooltip>
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
