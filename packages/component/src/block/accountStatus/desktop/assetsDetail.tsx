import { memo, useCallback, useContext, useMemo } from "react";
import { Numeral } from "@/text";
import {
  useCollateral,
  useMarginRatio,
  usePositionStream,
} from "@orderly.network/hooks";
import { AssetsContext } from "@/provider";
import { modal } from "@orderly.network/ui";
import { SettlePnlContent } from "@/block/withdraw";
import { RefreshCcw } from "lucide-react";
import { DesktopFreeCollat } from "@/block/orderEntry/sections/freeCollat";
import { Tooltip } from "@/tooltip";
import { cn } from "@/utils";
import { Decimal } from "@orderly.network/utils";

const AssetsDetail = () => {
  const { freeCollateral } = useCollateral({
    dp: 2,
  });

  const [{ aggregated }] = usePositionStream();

  const { onSettle } = useContext(AssetsContext);
  const { mmr } = useMarginRatio();
  const renderMMR = useMemo(() => {
    if (!mmr) {
      return "-";
    }
    const bigMMR = new Decimal(mmr);
    return bigMMR.mul(100).todp(2, 0).toFixed(2);
  }, [mmr]);
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
        <div className="orderly-flex orderly-justify-end orderly-gap-1">
          <Numeral
            surfix={
              <span className={"orderly-text-base-contrast-36"}>USDC</span>
            }
          >
            {freeCollateral}
          </Numeral>
        </div>
      </div>
      <div
        className={
          "orderly-flex orderly-justify-between orderly-text-base-contrast-54"
        }
      >
        <div className="orderly-text-xs orderly-text-base-contrast-54 orderly-cursor-pointer">
          Maintenance margin ratio
        </div>
        <div className="orderly-flex orderly-justify-end orderly-gap-1">
          <Numeral
            surfix={<span className={"orderly-text-base-contrast-36"}>%</span>}
          >
            {renderMMR}
          </Numeral>
        </div>
      </div>
    </div>
  );
};

export const MemorizedAssetsDetail = memo(AssetsDetail);
