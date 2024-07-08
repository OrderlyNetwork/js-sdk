import { registerSimpleDialog } from "@orderly.network/ui";
import { MainNav } from "./mainNav.ui";
import { useMainNavBuilder } from "./useWidgetBuilder.script";
import { NotSupportedDialog } from "../chainMenu/chainMenu.ui";

registerSimpleDialog("SwitchChain", NotSupportedDialog, {
  title: "Switch Chain",
  size: "sm",
  // message: "This feature is not supported on this chain.",
});

export const MainNavWidget = () => {
  const state = useMainNavBuilder();
  return <MainNav {...state} />;
};
