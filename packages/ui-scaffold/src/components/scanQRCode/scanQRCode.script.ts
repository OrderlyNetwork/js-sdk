import { useEffect, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";

export type UseScanQRCodeScriptReturn = ReturnType<typeof useScanQRCodeScript>;

export function useScanQRCodeScript() {
  const [open, setOpen] = useState(false);
  const [showScanTooltip, setShowScanTooltip] = useLocalStorage(
    "orderly_qr_code_scan_tooltip_open",
    true,
  );

  const showDialog = () => {
    setOpen(true);
  };

  const hideDialog = () => {
    setOpen(false);
  };

  const onScanSuccess = (url: string) => {
    if (isValidURL(url)) {
      window.location.href = url;
    }
  };

  useEffect(() => {
    if (showScanTooltip) {
      setTimeout(() => {
        setShowScanTooltip(false);
      }, 8000);
    }
  }, [showScanTooltip]);

  return {
    open,
    onOpenChange: setOpen,
    showDialog,
    hideDialog,
    onScanSuccess,
    showScanTooltip,
  };
}

function isValidURL(str: string) {
  try {
    const url = new URL(str);
    return ["http:", "https:"].includes(url.protocol);
  } catch (e) {
    return false;
  }
}
