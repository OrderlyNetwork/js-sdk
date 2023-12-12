import { FC, useCallback, useContext, useMemo } from "react";
import { Numeral } from "@/text";
import { Progress } from "@/progress";

import { ChevronDown, RefreshCcw } from "lucide-react";
import { useLocalStorage, useCollateral, usePositionStream, useMarginRatio } from "@orderly.network/hooks";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/collapsible/collapsible";
import { MemorizedLeverage } from "@/block/accountStatus/full/leverage";
import { MemorizedAssetsDetail } from "@/block/accountStatus/full/assetsDetail";

interface AssetsProps {
  totalBalance: number;
}

const KEY = "ORDERLY_WEB_ASSETS_COLLAPSED";

export const Assets: FC<AssetsProps> = (props) => {
  // const [expand, { toggle }] = useBoolean(false);

  const [collapsed, setCollapsed] = useLocalStorage(KEY, 1);
  const { totalCollateral, freeCollateral, totalValue, availableBalance } =
    useCollateral({
      dp: 2,
    });

    const [{ aggregated }, positionsInfo] =
    usePositionStream();
    const { marginRatio } = useMarginRatio();

    const marginRatioVal = useMemo(() => {
      return Math.min(
        10,
        aggregated.notional === 0
          ? positionsInfo["margin_ratio"](10)
          : marginRatio
      );
    }, [marginRatio, aggregated]);

    

  return (
    <Collapsible
      open={collapsed > 0}
      onOpenChange={(value) => {
        setCollapsed(value ? 1 : 0);
      }}
    >
      <div
        className={
          "orderly-py-3 orderly-flex orderly-justify-between orderly-items-center"
        }
      >
        <div className={"orderly-flex-1"}>
          <div className={"orderly-text-3xs orderly-text-base-contrast-54"}>
            Total balance
          </div>
          <div>
            <Numeral
              surfix={
                <span
                  className={
                    "orderly-text-base-contrast-36 orderly-font-medium"
                  }
                >
                  USDC
                </span>
              }
            >
              {availableBalance}
            </Numeral>
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <button className="orderly-p-1 orderly-rounded hover:orderly-bg-base-900 data-[state=open]:orderly-rotate-180 orderly-transition-transform">
            {/* @ts-ignore */}

            <ChevronDown
              size={18}
              className={"orderly-text-base-contrast-54"}
            />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <MemorizedAssetsDetail />
      </CollapsibleContent>

      <div className={"orderly-pb-4"}>
        <Progress value={marginRatioVal} variant={"gradient"}/>
      </div>
      <MemorizedLeverage />
    </Collapsible>
  );
};
