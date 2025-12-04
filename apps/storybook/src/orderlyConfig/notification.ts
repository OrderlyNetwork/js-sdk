import type { OrderlyAppProviderProps } from "@veltodefi/react-app";

export const notification: OrderlyAppProviderProps["notification"] = {
  orderFilled: {
    media: "https://oss.orderly.network/static/sdk/coin.mp3",
    defaultOpen: true,
    displayInOrderEntry: true,
  },
};
