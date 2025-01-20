import { useLinkDeviceScript } from "./linkDevice.script";
import { LinkDevice } from "./linkDevice.ui";

export const LinkDeviceWidget = () => {
  const state = useLinkDeviceScript();
  return <LinkDevice {...state} />;
};
