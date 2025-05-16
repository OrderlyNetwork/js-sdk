import { useScreen } from "@orderly.network/ui";
import { useLinkDeviceScript } from "./linkDevice.script";
import { LinkDevice } from "./linkDevice.ui";
import { LinkDeviceMobile } from "./linkDevice.ui.mobile";

export const LinkDeviceWidget = () => {
  const { isMobile } = useScreen();
  const state = useLinkDeviceScript();
  if (isMobile) {
    return <LinkDeviceMobile {...state} />;
  }
  return <LinkDevice {...state} />;
};
