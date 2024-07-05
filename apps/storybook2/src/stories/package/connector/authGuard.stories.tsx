import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { AuthGuard } from "@orderly.network/ui-connector";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { AccountStatusEnum } from "@orderly.network/types";
import { Text } from "@orderly.network/ui";

const meta = {
  title: "Package/ui-connector/AuthGuard",
  component: AuthGuard,
  // subComponents: { Logo },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: AccountStatusEnum.EnableTrading,
    children: <Text>Enabled trading</Text>,
  },
};
