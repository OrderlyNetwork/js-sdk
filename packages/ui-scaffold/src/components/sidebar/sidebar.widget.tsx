import { SideBar } from "./sidebar.ui";
import { useSideNavBuilder } from "./useSideNavBuilder.script";

export const SideNavbarWidget = () => {
  const state = useSideNavBuilder();
  return <SideBar {...state} />;
};
