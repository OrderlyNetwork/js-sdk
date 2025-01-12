import { useQRCodeScript } from "./QRCode.script";
import { QRCode, type QRCodeProps } from "./QRCode.ui";

export type QRCodeWidgetProps = Pick<QRCodeProps, "close">;

export const QRCodeWidget = (props: QRCodeWidgetProps) => {
  const state = useQRCodeScript(props);
  return <QRCode {...state} {...props} />;
};
