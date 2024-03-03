import { PositionShareIcon } from "@/icon";
import { cn } from "@/utils";
import { FC, PropsWithChildren } from "react";
import { modal } from "@/modal";
import { SharePoisitionView } from "./sharePosition";
import { useLeverage } from "@orderly.network/hooks";


export const SharePnLIcon: FC<PropsWithChildren<{
    className?: string,
    position: any,
}>> = (props) => {
    const [leverage] = useLeverage();
    console.log("share icon ", leverage);
    
    return (<PositionShareIcon
        size={12}
        className={
            cn("orderly-fill-white/20 hover:orderly-fill-white/80 hover:orderly-cursor-pointer orderly-inline-block", props.className)
        }
        fill="current"
        fillOpacity={1}
        onClick={() => {
            
            modal.show(SharePoisitionView, {
                position: props.position,
            });
        }}
    />);
}