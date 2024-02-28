import { PositionShareIcon } from "@/icon";
import { Logo } from "@/logo";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
import { cn } from "@/utils";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { FC, PropsWithChildren } from "react";
import { MobileSharePnLContent } from "./mobileSharePnl";

export const SharePnLIcon: FC<PropsWithChildren<{
    className?: string,
    position: any,
}>> = (props) => {
    const isTablet = useMediaQuery(MEDIA_TABLET);

    return isTablet ? <MobileSharePnL className={props.className} position={props.position} children={props.children} /> : <DesktopSharePnL className={props.className} position={props.position} children={props.children} />;
}

const MobileSharePnL: FC<PropsWithChildren<{
    className?: string,
    position: any,
}>> = (props) => {
    const onClick = () => {
        console.log("xxxxx onclick", props.position);

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
            <MobileSharePnLContent position={props.position} />
        </SheetContent>
    </Sheet>);
}

const DesktopSharePnL: FC<PropsWithChildren<{
    className?: string,
    position: any,
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