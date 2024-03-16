import { FC, useState } from "react";
import { PinIcon, UnPinIcon } from "../icons/pin";

export const PinView: FC<{
    pin: boolean,
    onPinChange?: (isPin: boolean) => void
}> = (props) => {
    const {pin} = props;
    return (
        <button onClick={()=> {
            props.onPinChange?.(!pin);
        }}>
            {pin === false ? <PinIcon /> : <UnPinIcon />}
        </button>
    );
}