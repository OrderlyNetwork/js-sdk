import { SideBar, SideBarProps } from "./sidebar.ui";
import { useSideNavBuilder } from "./useSideNavBuilder.script";

export const SideNavbarWidget = (props?: Partial<SideBarProps>) => {
  const state = useSideNavBuilder(props);

  return <SideBar {...state} />;
};
