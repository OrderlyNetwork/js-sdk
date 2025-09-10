import React from "react";
import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

const specialFeeIsActive = false; // mock for sdk

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
  orderEntry: specialFeeIsActive
    ? {
        fees: {
          // trailing: (original) => original,
        },
      }
    : undefined,
  feeTier: specialFeeIsActive
    ? {
        // header: () => null,
        // tag: () => null,
        // table: () => null,
      }
    : undefined,
};
