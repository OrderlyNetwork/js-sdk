import { FC, useContext } from "react";
import { Size } from "../icon/types";
import { OrderlyAppContext } from "@/provider/appProvider";
import { NetworkImage } from "../icon/networkImage";

interface Props {
  size?: Size | number;
}

export const PopoverLogo: FC<Props> = (props) => {
  const { appIcons } = useContext(OrderlyAppContext);

  if (!appIcons) return null;

  const { popover } = appIcons;

  if (popover?.component) {
    return popover.component;
  }

  if (popover?.img) {
    return (
      <NetworkImage
        size={props.size}
        type={"path"}
        rounded
        path={popover.img}
      />
    );
  }

  return null;
};
