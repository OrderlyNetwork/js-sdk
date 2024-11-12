import type { Meta, StoryObj } from "@storybook/react";
import { FeeTierModule, OrdersModule } from "@orderly.network/portfolio";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { Box } from "@orderly.network/ui";

const meta: Meta<typeof FeeTierModule.FeeTierPage> = {
  title: "Package/Portfolio/Orders",
  component: OrdersModule.OrdersPage,
  subcomponents: {},
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          <Box className="oui-h-[calc(100vh)]" p={6}>
            <Story />
          </Box>
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    // p: {
    //   control: {
    //     type: "number",
    //     min: 0,
    //     max: 10,
    //     step: 1,
    //   },
    // },
  },
  args: {
    // p: 5,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};
