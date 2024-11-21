import type { Meta, StoryObj } from "@storybook/react";
import { Box, Button, modal } from "@orderly.network/ui";
import { ChainSelectorWidget } from "@orderly.network/ui-chain-selector";

const meta: Meta<typeof ChainSelectorWidget> = {
  title: "Package/ui-chain-selector/ChainSelector",
  component: ChainSelectorWidget,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Box width="380px" intensity={800} r="lg" p={4}>
      <ChainSelectorWidget />
    </Box>
  ),
};

export const OnlyMainnet: Story = {
  render: () => (
    <Box width="380px" intensity={800} r="lg" p={4}>
      <ChainSelectorWidget networkId="mainnet" />
    </Box>
  ),
};

export const CommandStyle: Story = {
  render: () => (
    <Button
      onClick={() => {
        modal
          .show("ChainSelector")
          .then((result) => {
            console.log("result", result);
          })
          .catch((error) => {
            console.log("error", error);
          });
      }}
    >
      Switch chain
    </Button>
  ),
};

export const CommandStyleMainnet: Story = {
  render: () => (
    <Button
      onClick={() => {
        modal
          .show("ChainSelector", {
            networkId: "mainnet",
          })
          .then((result) => {
            console.log("result", result);
          })
          .catch((error) => {
            console.log("error", error);
          });
      }}
    >
      Switch chain
    </Button>
  ),
};
