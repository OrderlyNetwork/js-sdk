import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

export const notification: OrderlyAppProviderProps["notification"] = {
  orderFilled: {
    media: "https://oss.orderly.network/static/sdk/coin.mp3",
  },
};
