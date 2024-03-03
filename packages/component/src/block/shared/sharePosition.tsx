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
    const { maxLeverage } = useLeverage();

    console.log("xxxxxx SharePoisitionView", maxLeverage);
    

    return isTablet ?
        <MobileSharePnL
            position={position}
            leverage={maxLeverage}
        /> :
        <DesktopSharePnL
            position={position}
            leverage={maxLeverage}
        />;
});



const MobileSharePnL: FC<PropsWithChildren<{
    className?: string,
    position: any,
    leverage: number,
}>> = (props) => {
    const {leverage, position} = props;
    const { visible, hide, resolve, reject, onOpenChange } = useModal();
   
    return (<Sheet open={visible} onOpenChange={onOpenChange}>
        <SheetContent
        >
            <SheetHeader
                id="orderly-asset-and-margin-sheet-title"
                leading={<Logo.secondary size={30} />}
            >
                PnL Sharing
            </SheetHeader>
            <MobileSharePnLContent position={position} leverage={leverage}/>
        </SheetContent>
    </Sheet>);
}

const DesktopSharePnL: FC<PropsWithChildren<{
    className?: string,
    position: any,
    leverage: number,
}>> = (props) => {
    const {leverage, position} = props;
    const { visible, hide, resolve, reject, onOpenChange } = useModal();
   
    return (<Dialog open={visible} onOpenChange={onOpenChange}>
        <DialogContent className="orderly-shadow-lg orderly-h-[807px] orderly-w-[640px] orderly-bg-base-700 desktop:orderly-max-w-[640px]">
            <DesktopSharePnLContent position={position} leverage={leverage} />
        </DialogContent>
    </Dialog>);
}