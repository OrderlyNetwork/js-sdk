import { FC } from "react";
import { Numeral } from "@/text";
import { Progress } from "@/progress";

import { ChevronDown } from "lucide-react";
import { useLocalStorage } from "@orderly.network/hooks";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/collapsible/collapsible";

interface AssetsProps {
  totalBalance: number;
}

const KEY = "ORDERLY_WEB_ASSETS_COLLAPSED";

export const Assets: FC<AssetsProps> = (props) => {
  // const [expand, { toggle }] = useBoolean(false);

  const [collapsed, setCollapsed] = useLocalStorage(KEY, 1);

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
              {props.totalBalance}
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
        <div
          className={
            "orderly-text-xs orderly-py-4 orderly-mb-4 orderly-border-b orderly-border-t orderly-border-divider orderly-space-y-2"
          }
        >
          <div className={"orderly-flex orderly-justify-between"}>
            <span className={"orderly-text-base-contrast-54"}>
              Free collateral
            </span>
            <Numeral
              surfix={
                <span className={"orderly-text-base-contrast-36"}>USDC</span>
              }
            >
              213131
            </Numeral>
          </div>
          <div className={"orderly-flex orderly-justify-between"}>
            <span className={"orderly-text-base-contrast-54"}>
              Unsettled PnL
            </span>
            <Numeral
              surfix={
                <span className={"orderly-text-base-contrast-36"}>USDC</span>
              }
            >
              213131
            </Numeral>
          </div>
        </div>
      </CollapsibleContent>

      <div className={"orderly-pb-4"}>
        <Progress value={40} />
      </div>
      <div className={"orderly-flex orderly-justify-between orderly-text-xs"}>
        <div className={"orderly-flex orderly-flex-col"}>
          <Numeral rule={"percentages"} coloring>
            0.72
          </Numeral>
          <span className={"orderly-text-base-contrast-54 orderly-text-2xs"}>
            Margin ratio
          </span>
        </div>
        <div className={"orderly-flex orderly-flex-col orderly-items-end"}>
          <span>727%</span>
          <span className={"orderly-text-base-contrast-54 orderly-text-2xs"}>
            Account leverage
          </span>
        </div>
      </div>
    </Collapsible>
  );
};
