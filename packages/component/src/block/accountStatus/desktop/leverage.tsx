import { memo } from "react";
import { Pencil } from "lucide-react";
import {
  useMarginRatio,
  useAccountInfo,
  useLeverage,
} from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";
import { LeverageWidgetWithDialogId } from "@orderly.network/ui-leverage";
import { Divider } from "@/divider";
import { Numeral } from "@/text";
import { Tooltip } from "@/tooltip";
import { cn } from "@/utils";
import { getMarginRatioColor } from "../utils";
import { LeverageDialog } from "./leverageDialog";

interface LeverageAndMarginRatioProps {
  isConnected: boolean;
}

const LeverageAndMarginRatio = (props: LeverageAndMarginRatioProps) => {
  const { isConnected, ...rest } = props;
  const { marginRatio, currentLeverage, mmr } = useMarginRatio();
  const [maxLeverage, { update, config: leverageLevers }] = useLeverage();

  const marginRatioVal = marginRatio === 0 ? 10 : Math.min(marginRatio, 10);

  const { isRed, isYellow, isGreen } = getMarginRatioColor(marginRatioVal, mmr);

  return (
    <div
      id="orderly-account-leverage"
      className={"orderly-flex orderly-justify-between orderly-text-xs"}
      {...rest}
    >
      <div
        className={
          "orderly-flex orderly-flex-col orderly-tabular-nums orderly-items-start"
        }
      >
        <Tooltip
          // @ts-ignore
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
            id="orderly-account-margin-ratio-title"
            className={
              "orderly-text-base-contrast-54 orderly-text-3xs orderly-cursor-pointer"
            }
          >
            Margin ratio
          </div>
        </Tooltip>
        <Numeral
          id="orderly-account-margin-ratio-value"
          className={cn(
            "orderly-text-base-contrast",
            isConnected &&
              cn({
                "orderly-text-[#FF67C2]": isRed,
                "orderly-text-[#FFCF73]": isYellow,
                "orderly-text-[#1EF6B4]": isGreen,
              }),
          )}
          rule={"percentages"}
          coloring
        >
          {isConnected ? marginRatioVal : "-"}
        </Numeral>
      </div>
      <div
        id="orderly-desktop-max-leverage"
        className={"orderly-flex orderly-flex-col orderly-items-end"}
      >
        <Tooltip
          content={
            "Your actual Leverage of the whole account / Your max Leverage of the whole account"
          }
          className="orderly-max-w-[270px]"
        >
          <div
            id="orderly-account-leverage-title"
            className={
              "orderly-text-base-contrast-54 orderly-text-3xs orderly-cursor-pointer"
            }
          >
            Account leverage
          </div>
        </Tooltip>
        <div
          id="orderly-account-leverage-value"
          className={
            "orderly-flex orderly-items-center orderly-gap-1 orderly-text-2xs"
          }
        >
          {isConnected ? (
            <Numeral surfix={"x"}>{currentLeverage}</Numeral>
          ) : (
            "-"
          )}

          <span className={"orderly-text-base-contrast-54"}>/</span>
          {/* {isConnected ? (
            <LeverageDialog>
              <button
                id="orderly-desktop-leverage-button"
                className="orderly-flex orderly-items-center orderly-gap-1"
              >
                <span>{`${maxLeverage ?? "-"}x`}</span>
                {typeof maxLeverage !== "undefined" && (
                  // @ts-ignore
                  <Pencil size={14} className="orderly-text-base-contrast-54" />
                )}
              </button>
            </LeverageDialog>
          ) : (
            "-"
          )} */}
          {
            // modal.show(LeverageWidgetWithDialogId, { currentLeverage: 5 });
            isConnected ? (
              <button
                id="orderly-desktop-leverage-button"
                className="orderly-flex orderly-items-center orderly-gap-1"
                onClick={() => {
                  modal.show(LeverageWidgetWithDialogId, {
                    currentLeverage: 5,
                  });
                }}
              >
                <span>{`${maxLeverage ?? "-"}x`}</span>
                {typeof maxLeverage !== "undefined" && (
                  // @ts-ignore
                  <Pencil size={14} className="orderly-text-base-contrast-54" />
                )}
              </button>
            ) : (
              "-"
            )
          }
        </div>
      </div>
    </div>
  );
};

export const MemorizedLeverage = memo(LeverageAndMarginRatio);
