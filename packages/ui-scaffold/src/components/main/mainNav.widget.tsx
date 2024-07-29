import { MainNav } from "./mainNav.ui";
import { MainNavProps, useMainNavBuilder } from "./useWidgetBuilder.script";

import { PropsWithChildren } from "react";

export const MainNavWidget = (
  props: PropsWithChildren<Partial<MainNavProps>>
) => {
  const { children, ...rest } = props;
  const state = useMainNavBuilder(rest);
  return <MainNav {...state} children={children} />;
};
