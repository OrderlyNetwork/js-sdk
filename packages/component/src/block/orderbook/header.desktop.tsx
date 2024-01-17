import { FC, useContext, useMemo } from "react";

import { OrderBookContext } from "./orderContext";

import { SwitchIcon } from "@/icon";

interface Props {
    quote: string;
    base: string;
    // onModeChange?: (mode: QtyMode) => void;
}

export const DesktopHeader: FC<Props> = (props) => {
    const { showTotal } = useContext(OrderBookContext);

    return (
        <div className="orderly-flex orderly-flex-1 orderly-flex-row orderly-justify-between orderly-text-base-contrast-36 orderly-text-4xs desktop:orderly-text-3xs orderly-pb-2 desktop:orderly-pt-2">

            <Title name="Price" token={props.quote} />
            <Title name="Qty" token={props.base} />
            <Title name="Total" token={props.base} />
            {showTotal && <Title name="Total" token={props.quote} />}

        </div>
    );
};

const Title: FC<{
    name: string;
    token: string;
}> = (props) => {
    const { name, token } = props;
    return (
        <div
            id="orderly-order-book-header-qty"
            className="orderly-flex orderly-flex-col desktop:orderly-flex-row desktop:orderly-items-center orderly-text-base-contrast-36 orderly-text-4xs orderly-items-end orderly-mr-1"
        >
            <span className="desktop:orderly-text-2xs">{name}</span>
            <span>{`(${token})`}</span>
        </div>
    );

}