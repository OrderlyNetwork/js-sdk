import { FC } from "react";
import { Numeral } from "@/text";
import { Progress } from "@/progress";

interface AssetsProps {
  totalBalance: number;
}

export const Assets: FC<AssetsProps> = (props) => {
  return (
    <div>
      <div className={"orderly-py-3"}>
        <div className={"orderly-text-3xs orderly-text-base-contrast-54"}>
          Total balance
        </div>
        <div>
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
      </div>
      <div
        className={
          "orderly-text-xs orderly-py-4 orderly-border-b orderly-border-t orderly-border-divider orderly-space-y-2"
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
          <span className={"orderly-text-base-contrast-54"}>Unsettled PnL</span>
          <Numeral
            surfix={
              <span className={"orderly-text-base-contrast-36"}>USDC</span>
            }
          >
            213131
          </Numeral>
        </div>
      </div>
      <div className={"orderly-py-4"}>
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
    </div>
  );
};
