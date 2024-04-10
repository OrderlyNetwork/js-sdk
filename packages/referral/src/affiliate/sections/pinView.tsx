import { FC, useState } from "react";
import { PinIcon, UnPinIcon } from "../icons/pin";

export const PinView: FC<{
    pin: boolean,
    onPinChange?: (isPin: boolean) => void
}> = (props) => {
    const {pin} = props;
    return (
        <div 
        className="orderly-cursor-pointer"
        onClick={()=> {
            props.onPinChange?.(!pin);
        }}>
            {pin === false ? <PinIcon fillOpacity={1} className="orderly-fill-base-contrast-36 hover:orderly-fill-base-contrast"/> : <UnPinIcon fillOpacity={1} className="orderly-fill-primary hover:orderly-fill-primary/80"/>}
        </div>
    );
}