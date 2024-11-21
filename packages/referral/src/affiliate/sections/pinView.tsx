import { FC } from "react";
import { PinIcon, UnPinIcon } from "../icons/pin";

export const PinView: FC<{
    pin: boolean,
    onPinChange?: (isPin: boolean) => void
}> = (props) => {
    const { pin } = props;
    return (
        <button
            className="orderly-cursor-pointer"
            onClick={() => {
                props.onPinChange?.(!pin);
            }}>
            {pin === false ? <PinIcon fillOpacity={1} className="orderly-fill-base-contrast-36 hover:orderly-fill-base-contrast" /> : <UnPinIcon fillOpacity={1} className="orderly-fill-primary-darken hover:orderly-fill-primary-darken/80" />}
        </button>
    );
}