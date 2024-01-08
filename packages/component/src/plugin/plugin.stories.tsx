import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ExtensionSlot } from "./slot";
import { ExtensionPosition } from "./types";

import "./plugins/deposit";

const PluginDemo = () => {
  return (
    <div>
      <ExtensionSlot
        position={ExtensionPosition.DepositForm}
        symbol={"PERP_ETH_USDC"}
      />
    </div>
  );
};

const meta: Meta<typeof PluginDemo> = {
  component: PluginDemo,
  title: "Plugin/base",
};

export default meta;

type Story = StoryObj<typeof PluginDemo>;

export const Default: Story = {
  args: {},
};
