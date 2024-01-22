import { memo } from "react";
import {
  useMarginRatio,
  useAccountInfo,
  useLeverage,
} from "@orderly.network/hooks";
import { Numeral } from "@/text";
import { Pencil } from "lucide-react";
import { LeverageDialog } from "./leverageDialog";
import { Tooltip } from "@/tooltip";
import { Divider } from "@/divider";

const LeverageAndMarginRatio = () => {
  const { marginRatio, currentLeverage } = useMarginRatio();
  const [maxLeverage, { update, config: leverageLevers }] = useLeverage();

  return (
    <div className={"orderly-flex orderly-justify-between orderly-text-xs"}>
      <div
        className={
          "orderly-flex orderly-flex-col orderly-tabular-nums orderly-items-start"
        }
      >
        <Tooltip
          content={
            <div>
              <span>
                Your actual Leverage of the whole account / Your max Leverage of
                the whole account
              </span>
              <Divider className="orderly-py-2 orderly-border-white/10" />
              <span>
                Margin ratio = Total collateral / Total position notional
              </span>
            </div>
          }
          className="orderly-max-w-[270px]"
        >
          <div
            className={
              "orderly-text-base-contrast-54 orderly-text-3xs orderly-cursor-pointer"
            }
          >
            Margin ratio
          </div>
        </Tooltip>
        <Numeral rule={"percentages"} coloring>
          {marginRatio === 0 ? 10 : Math.min(marginRatio, 10)}
        </Numeral>
      </div>
      <div className={"orderly-flex orderly-flex-col orderly-items-end"}>
        <Tooltip
          content={
            "Your actual Leverage of the whole account / Your max Leverage of the whole account"
          }
          className="orderly-max-w-[270px]"
        >
          <div
            className={
              "orderly-text-base-contrast-54 orderly-text-3xs orderly-cursor-pointer"
            }
          >
            Account leverage
          </div>
        </Tooltip>
        <div
          className={
            "orderly-flex orderly-items-center orderly-gap-1 orderly-text-2xs"
          }
        >
          <Numeral surfix={"x"}>{currentLeverage}</Numeral>

          <span className={"orderly-text-base-contrast-54"}>/</span>
          <LeverageDialog>
            <button className="orderly-flex orderly-items-center orderly-gap-1">
              <span>{`${maxLeverage ?? "-"}x`}</span>
              {typeof maxLeverage !== "undefined" && (
                // @ts-ignore
                <Pencil size={14} className="orderly-text-base-contrast-54" />
              )}
            </button>
          </LeverageDialog>
        </div>
      </div>
    </div>
  );
};

export const MemorizedLeverage = memo(LeverageAndMarginRatio);
