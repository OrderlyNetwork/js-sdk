import { FC, useContext, useMemo } from "react";

import { OrderBookContext } from "../orderContext";
import { cn } from "@/utils";

interface Props {
    quote: string;
    base: string;
    // onModeChange?: (mode: QtyMode) => void;
}

export const DesktopHeader: FC<Props> = (props) => {
    const { showTotal } = useContext(OrderBookContext);

    // return (
    //     <div className="orderly-flex orderly-flex-1 orderly-flex-row orderly-justify-between orderly-text-base-contrast-36 orderly-text-4xs desktop:orderly-text-3xs orderly-pb-2 desktop:orderly-pt-2">

    //         <Title name="Price" token={props.quote} />
    //         <Title name="Qty" token={props.base} />
    //         <Title name="Total" token={props.base} />
    //         {showTotal && <Title name="Total" token={props.quote} />}

    //     </div>
    // );

    return (
        <div className="orderly-flex orderly-flex-row orderly-justify-between orderly-text-base-contrast-80 orderly-text-3xs orderly-relative orderly-font-bold orderly-cursor-pointer orderly-mb-1">
            <div className={
                cn("orderly-basis-7/12 orderly-flex orderly-felx-row orderly-items-center orderly-mr-2",
                    showTotal && "orderly-basis-5/12")
            }>
                <div className="orderly-flex-1 orderly-text-left">
                    <Title name="Price" token={props.quote} />
                </div>
                <div className="orderly-flex-1 orderly-text-right orderly-text-base-contrast-80">
                    <Title name="Qty" token={props.base} justifyEnd />
                </div>
            </div>
            <div className={cn(
                "orderly-basis-5/12 orderly-flex orderly-fex-row",
                showTotal && "orderly-basis-7/12"
            )}>
                <div className={cn(
                    "orderly-flex-1 orderly-pr-6",
                    showTotal && "orderly-pr-3"
                )}>

                    <Title name="Total" token={props.base} justifyEnd />
                </div>
                {showTotal && (
                    <div className="orderly-flex-1 orderly-pr-3">

                        <Title name="Total" token={props.quote} justifyEnd />
                    </div>
                )}

            </div>


        </div>
    );
};

const Title: FC<{
    name: string;
    token: string;
    justifyEnd?: boolean;
}> = (props) => {
    const { name, token, justifyEnd = false } = props;
    return (
        <div
            id="orderly-order-book-header-qty"
            className={
                cn(
                    "orderly-flex orderly-flex-row orderly-text-base-contrast-36 orderly-text-4xs orderly-items-end",
                    justifyEnd && "orderly-justify-end",
                )
            }
        >
            <span className="desktop:orderly-text-2xs">{name}</span>
            <span>{`(${token})`}</span>
        </div>
    );

}