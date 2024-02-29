import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { Sheet, SheetContent, SheetHeader } from "@/sheet/sheet";
import { Dialog, DialogContent } from "@/dialog/dialog";
import { useLeverage, useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { FC, PropsWithChildren, useState } from "react";
import { DesktopSharePnLContent } from "./desktopSharePnl";
import { Logo } from "@/logo";
import { MobileSharePnLContent } from "./mobileSharePnl";

export const SharePoisitionView = create<{ position: any }>((props) => {
    

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
            position={props.position}
            canvasData={canvasData}
        /> :
        <DesktopSharePnL
            position={props.position}
            canvasData={canvasData}
        />;
});



const MobileSharePnL: FC<PropsWithChildren<{
    className?: string,
    position: any,
    canvasData: any,
}>> = (props) => {
    const { visible, hide, resolve, reject, onOpenChange } = useModal();
    const [snapshot, setSnapshot] = useState<any>();
    const onClick = () => {
        console.log("xxxxx onclick", props.position, props.canvasData());
        setSnapshot(props.canvasData());
    };
    return (<Sheet open={visible} onOpenChange={onOpenChange}>
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
    const { visible, hide, resolve, reject, onOpenChange } = useModal();
    const [snapshot, setSnapshot] = useState<any>();
    const onClick = () => {
        console.log("xxxxx onclick", props.position, props.canvasData());
        setSnapshot(props.canvasData());
    };
    return (<Dialog open={visible} onOpenChange={onOpenChange}>
        <DialogContent className="orderly-shadow-lg orderly-h-[807px] orderly-w-[640px] orderly-bg-base-700 desktop:orderly-max-w-[640px]">
            <DesktopSharePnLContent position={props.position} snapshot={snapshot} />
        </DialogContent>
    </Dialog>);
}