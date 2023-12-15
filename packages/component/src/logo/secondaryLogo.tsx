import { FC, useContext } from "react";
import { Size } from "../icon/types";
import { OrderlyAppContext } from "@/provider/appProvider";
import { NetworkImage } from "../icon/networkImage";

interface Props {
  size?: Size | number;
}

export const SecondaryLogo: FC<Props> = (props) => {
  const { appIcons } = useContext(OrderlyAppContext);

  if (!appIcons) return null;

  const { secondary } = appIcons;

  if (secondary?.component) {
    return secondary.component;
  }

  if (secondary?.img) {
    return (
      <NetworkImage
        size={props.size}
        type={"path"}
        rounded
        path={secondary.img}
      />
    );
  }

  return null;
};
