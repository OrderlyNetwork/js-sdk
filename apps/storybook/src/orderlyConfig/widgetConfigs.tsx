import React from "react";
import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

export const widgetConfigs: OrderlyAppProviderProps["widgetConfigs"] = {
  scanQRCode: {
    onSuccess: (url) => {
      const urlObj = new URL(url);
      const { hostname, port, protocol } = window.location;
      urlObj.hostname = hostname;
      urlObj.port = port;
      urlObj.protocol = protocol;
      window.location.href = urlObj.toString();
    },
  },
  withdraw: {
    enableWithdrawToExternalWallet: true,
  },
};
