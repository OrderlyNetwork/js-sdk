import { FC } from "react";
import { Numeral } from "@/text";

interface AssetsProps {
  totalBalance: number;
}

export const Assets: FC<AssetsProps> = (props) => {
  return (
    <div className={"orderly-py-3"}>
      <div>Total balance</div>
      <div>
        <div className={"orderly-text-xl"}>
          <Numeral
            surfix={
              <span className={"orderly-text-base-contrast-36"}>USDC</span>
            }
          >
            {props.totalBalance}
          </Numeral>
        </div>
      </div>
      <div className={"orderly-flex orderly-justify-between"}>
        <div className={"orderly-flex orderly-flex-col"}>
          <span>727%</span>
          <span className={"orderly-text-base-contrast-54"}>Margin ratio</span>
        </div>
        <div className={"orderly-flex orderly-flex-col"}>
          <span>727%</span>
          <span className={"orderly-text-base-contrast-54"}>
            Account leverage
          </span>
        </div>
      </div>
    </div>
  );
};
