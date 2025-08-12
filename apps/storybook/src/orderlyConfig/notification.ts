import type { OrderlyAppProviderProps } from "@orderly.network/react-app";
import mediaSrc from "./audio/coin.mp3";

export const notification: OrderlyAppProviderProps["notification"] = {
  orderFilled: {
    media: mediaSrc,
  },
};
