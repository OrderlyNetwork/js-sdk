import { FC, useCallback } from "react";
import { boxVariants } from "../../box/box";
import { cnBase } from "tailwind-variants";
import { GradientText } from "../../typography/gradient";
import { Box } from "../../box";

export type MainNavItem = {
  name: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export const NavItem: FC<{
  item: MainNavItem;
  onClick?: (item: MainNavItem) => void;
  actived?: boolean;
}> = (props) => {
  const onClickHandler = useCallback(() => {
    props.onClick?.(props.item);
  }, [props.item]);

  return (
    <button
      disabled={props.item.disabled}
      data-actived={props.actived}
      className={cnBase(
        "oui-text-base-contrast-36 oui-text-sm oui-relative oui-group oui-rounded oui-px-3 oui-py-1 oui-h-[32px]",
        props.actived && "oui-bg-base-10"
      )}
      onClick={onClickHandler}
    >
      <GradientText color={props.actived ? "brand" : "inherit"} angle={45}>
        {props.item.name}
      </GradientText>
      <Box
        invisible={!props.actived}
        position="absolute"
        bottom={0}
        left={"50%"}
        height={"3px"}
        r="full"
        width={"38px"}
        gradient="brand"
        angle={45}
        className="-oui-translate-x-1/2 "
      />
    </button>
  );
};
