import { useLinkDeviceScript } from "./linkDevice.script";
import { LinkDevice, type LinkDeviceProps } from "./linkDevice.ui";

export type LinkDeviceWidgetProps = Pick<LinkDeviceProps, "close">;

export const LinkDeviceWidget = (props: LinkDeviceWidgetProps) => {
  const state = useLinkDeviceScript(props);
  return <LinkDevice {...state} {...props} />;
};
