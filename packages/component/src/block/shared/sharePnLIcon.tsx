import { PositionShareIcon } from "@/icon";
import { Logo } from "@/logo";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
import { cn } from "@/utils";
import { useLeverage, useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { FC, PropsWithChildren, useState } from "react";
import { MobileSharePnLContent } from "./mobileSharePnl";

export const SharePnLIcon: FC<PropsWithChildren<{
    className?: string,
    position: any,
}>> = (props) => {
    const isTablet = useMediaQuery(MEDIA_TABLET);
    const { position } = props;
    const [maxLeverage] = useLeverage();

    const canvasData = () => {
        return {
            side: position.position_qty > 0 ? "long" : "short",
            symbol: position.symbol,
            leverage: maxLeverage,
            pnl: position.unsettlement_pnl,
            roi: position.unsettled_pnl_ROI,
            openPrice: position.average_open_price,
            openTime: position.timestamp,
            quantity: position.position_qty,
            markPrice: position.mark_price,
        };

    };

    return isTablet ?
        <MobileSharePnL
            className={props.className}
            position={props.position}
            children={props.children}
            canvasData={canvasData}
        /> :
        <DesktopSharePnL
            className={props.className}
            position={props.position}
            children={props.children}
            canvasData={canvasData}
        />;
}

const MobileSharePnL: FC<PropsWithChildren<{
    className?: string,
    position: any,
    canvasData: any,
}>> = (props) => {
    const [snapshot, setSnapshot] = useState<any>();
    const onClick = () => {
        console.log("xxxxx onclick", props.position, props.canvasData());
        setSnapshot(props.canvasData());
    };
    return (<Sheet>
        <SheetTrigger>
            {props.children || <PositionShareIcon
                size={12}
                className={
                    cn("orderly-fill-white/20 hover:orderly-fill-white/80 hover:orderly-cursor-pointer", props.className)
                }
                fill="current"
                fillOpacity={1}
                onClick={onClick}
            />}
        </SheetTrigger>
        <SheetContent
        >
            <SheetHeader
                id="orderly-asset-and-margin-sheet-title"
                leading={<Logo.secondary size={30} />}
            >
                PnL Sharing
            </SheetHeader>
            <MobileSharePnLContent position={props.position} snapshot={snapshot} />
        </SheetContent>
    </Sheet>);
}

const DesktopSharePnL: FC<PropsWithChildren<{
    className?: string,
    position: any,
    canvasData: any,
}>> = (props) => {
    const isTablet = useMediaQuery(MEDIA_TABLET);
    const onClick = () => {
        console.log("xxxxx onclick", props.position);

    };
    return (<>
        <PositionShareIcon
            size={12}
            className={
                cn("orderly-fill-white/20 hover:orderly-fill-white/80 hover:orderly-cursor-pointer", props.className)
            }
            fill="current"
            fillOpacity={1}
            onClick={onClick}
        />
    </>);
}