import { FC, useState } from "react";
import { PinIcon, UnPinIcon } from "../icons/pin";

export const PinView: FC<{
    pin: boolean,
    onPinChange?: (isPin: boolean) => void
}> = (props) => {
    
    const [pin, setPin] = useState(props.pin);

    return (
        <button onClick={()=> {
            setPin((value) => !value);
        }}>
            {pin ? <PinIcon /> : <UnPinIcon />}
        </button>
    );
}