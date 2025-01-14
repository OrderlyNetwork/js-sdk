import { registerSimpleDialog } from "@orderly.network/ui";
import { LinkDeviceWidget } from "./widget";

export const LinkDeviceDialogId = "LinkDeviceDialogId";

registerSimpleDialog(LinkDeviceDialogId, LinkDeviceWidget, {
  title: "Confirm",
  size: "sm",
});
