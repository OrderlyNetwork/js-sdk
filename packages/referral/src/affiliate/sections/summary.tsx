import { FC } from "react";
import { HistoryIcon } from "../icons/history";
import { TriangleDownIcon } from "../icons/triangleDown";
import { USDCIcon } from "../icons/usdc";
import { Numeral } from "@orderly.network/react/src/text";

export const Summary = () => {

    return (
        <div className="orderly-p-6 orderly-bg-base-600">
            <div className="orderly-flex orderly-justify-between">
                <span className="orderly-text-base 2xl:orderly-text-lg">Summary</span>
                <button className="orderly-flex orderly-items-center orderly-justify-between orderly-gap-2 orderly-px-2 orderly-py-[6px]">
                    <HistoryIcon />
                    <span>All</span>
                    <TriangleDownIcon />
                </button>
            </div>

            <div className="orderly-mt-4 orderly-p-6 orderly-rounded-lg orderly-bg-gradient-to-t orderly-to-[rgba(41,137,226,1)] orderly-from-[rgba(39,43,147,1)]">
                <div className="orderly-text-center orderly-text-xs md:orderly-text-base lg:orderly-text-base xl:orderly-text-base 2xl:orderly-text-lg orderly-text-base-contrast-54">Commission (USDC)</div>
                <div className="orderly-flex orderly-justify-center orderly-items-center orderly-mt-3">
                    <USDCIcon />
                    <span className="orderly-ml-2 orderly-text-[22px] md:orderly-text-[24px] lg:orderly-text-[28px] xl:orderly-text-[28px] 2xl:orderly-text-[32px]">
                        0
                    </span>
                </div>
            </div>

            <div className="orderly-mt-2">
                <Item title="Referral vol. (USDC)" value={"0.0"} />
                <Item title="Referees" value={"0.0"} />
                <Item title="Referees that traded" value={"0.0"} />
            </div>
        </div>
    );
}


const Item: FC<{title: string, value: any}> = (props) => {
    const { title, value } = props;

    return (
        <div className="orderly-flex orderly-justify-between orderly-items-center orderly-mt-2">
            <div className="orderly-text-base-contrast-54 orderly-text-2xs 2xl:orderly-text-xs">
                {title}
            </div>

            <div className="orderly-text-2xs md:orderly-text-xs lg:orderly-text-xs xl:orderly-text-xs 2xl:orderly-text-base">{value}</div>
        </div>
    );
};