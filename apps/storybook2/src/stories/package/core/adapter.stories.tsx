import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { WalletConnectContent } from "@orderly.network/ui-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { Box, Card } from "@orderly.network/ui";

const meta = {
  title: "Package/core/adapter",
  component: WalletConnectContent,
  // subComponents: { Logo },
  parameters: {
    //   // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
  argTypes: {},
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return <div>Wallet Adapter</div>;
  },
};
