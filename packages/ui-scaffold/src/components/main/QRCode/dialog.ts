import { registerSimpleDialog } from "@orderly.network/ui";
import { QRCodeWidget } from "./widget";

export const QRCodeDialogId = "QRCodeDialogId";

registerSimpleDialog(QRCodeDialogId, QRCodeWidget, {
  title: "Confirm",
  size: "sm",
});
