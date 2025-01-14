import { useState } from "react";

export type UseScanQRCodeScriptReturn = ReturnType<typeof useScanQRCodeScript>;

export function useScanQRCodeScript() {
  const [open, setOpen] = useState(false);

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

  return {
    open,
    onOpenChange: setOpen,
    showDialog,
    hideDialog,
    onScanSuccess,
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
