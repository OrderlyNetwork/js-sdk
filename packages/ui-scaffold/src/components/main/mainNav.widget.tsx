import { MainNav, MainNavProps } from "./mainNav.ui";
import {
  MainNavWidgetProps,
  useMainNavBuilder,
} from "./useWidgetBuilder.script";

import { PropsWithChildren } from "react";

export const MainNavWidget = (
  props: PropsWithChildren<
    Partial<MainNavWidgetProps & Pick<MainNavProps, "classNames">>
  >
) => {
  const { children, ...rest } = props;
  const state = useMainNavBuilder(rest);
  return <MainNav {...state}>{children}</MainNav>;
};
