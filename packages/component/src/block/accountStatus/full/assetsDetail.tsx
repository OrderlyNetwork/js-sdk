import { memo } from "react";
import { Numeral } from "@/text";
import { useCollateral, usePositionStream } from "@orderly.network/hooks";

const AssetsDetail = () => {
  const { freeCollateral } = useCollateral({
    dp: 2,
  });

  const [{ aggregated }] = usePositionStream();

  return (
    <div
      className={
        "orderly-text-xs orderly-py-4 orderly-mb-4 orderly-border-b orderly-border-t orderly-border-divider orderly-space-y-2"
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
          surfix={<span className={"orderly-text-base-contrast-36"}>USDC</span>}
        >
          {aggregated?.unsettledPnL ?? 0}
        </Numeral>
      </div>
    </div>
  );
};

export const MemorizedAssetsDetail = memo(AssetsDetail);
