import { memo } from "react";
import { Pencil } from "lucide-react";
import { useMarginRatio, useLeverage } from "@orderly.network/hooks";
import { Numeral } from "@/text";
import { LeverageDialog } from "./leverageDialog";

const LeverageAndMarginRatio = () => {
  const { marginRatio, currentLeverage } = useMarginRatio();
  const { maxLeverage } = useLeverage();
  return (
    <div className={"orderly-flex orderly-justify-between orderly-text-xs"}>
      <div className={"orderly-flex orderly-flex-col"}>
        <div
          className={
            "orderly-flex orderly-items-center orderly-gap-1 orderly-text-2xs"
          }
        >
          <Numeral surfix={"x"}>{currentLeverage!}</Numeral>
          <span className={"orderly-text-base-contrast-54"}>/</span>
          <LeverageDialog>
            <button
              id="orderly-leverage-button"
              className="orderly-flex orderly-items-center orderly-gap-1"
            >
              <span>{`${maxLeverage ?? "-"}x`}</span>
              {typeof maxLeverage !== "undefined" && (
                // @ts-ignore
                <Pencil size={14} className="orderly-text-base-contrast-54" />
              )}
            </button>
          </LeverageDialog>
        </div>
        <div className={"orderly-text-base-contrast-54 orderly-text-3xs"}>
          Account leverage
        </div>
      </div>
      <div
        className={
          "orderly-flex orderly-flex-col orderly-tabular-nums orderly-items-end"
        }
      >
        <Numeral rule={"percentages"} coloring>
          {marginRatio === 0 ? 10 : Math.min(marginRatio, 10)}
        </Numeral>
        <span className={"orderly-text-base-contrast-54 orderly-text-2xs"}>
          Margin ratio
        </span>
      </div>
    </div>
  );
};

export const MemorizedLeverage = memo(LeverageAndMarginRatio);
