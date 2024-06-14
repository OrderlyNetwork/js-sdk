import React from "react";
import type {
  Renderer,
  PartialStoryFn as StoryFunction,
  StoryContext,
} from "@storybook/types";

import { useGlobals, useChannel } from "@storybook/preview-api";
import { initConfig } from "@orderly.network/web3-onboard";

const onboardAPI = initConfig();

export const withWalletConnect = (
  storyFn: StoryFunction<Renderer>,
  context: StoryContext<Renderer>
) => {
  const [globals, updateGlobals] = useGlobals();

  const emit = useChannel({
    connectWallet: (args) => {
      onboardAPI.connectWallet().then((res) => {
        emit("walletConnected", res);

        // account.setAddress(res.address);
      });
    },
  });

  return storyFn();
};
