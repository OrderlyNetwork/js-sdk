import { useScanQRCodeScript } from "./scanQRCode.script";
import { ScanQRCode } from "./scanQRCode.ui";

export const ScanQRCodeWidget = () => {
  const state = useScanQRCodeScript();
  return <ScanQRCode {...state} />;
};
