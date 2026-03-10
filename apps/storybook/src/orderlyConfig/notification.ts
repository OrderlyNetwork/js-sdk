import type { OrderlyAppProviderProps } from "@orderly.network/react-app";

export const notification: OrderlyAppProviderProps["notification"] = {
  orderFilled: {
    media: "https://oss.orderly.network/static/sdk/coin.mp3",
    defaultOpen: true,
    displayInOrderEntry: true,
    soundOptions: [
      {
        label: "Coin",
        value: "coin",
        media: "https://oss.orderly.network/static/sdk/coin.mp3",
      },
      {
        label: "Beep 1",
        value: "beep1",
        media:
          "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
      },
      {
        label: "Beep 2",
        value: "beep2",
        media:
          "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3",
      },
    ],
  },
};
