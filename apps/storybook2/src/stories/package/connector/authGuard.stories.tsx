import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ModalProvider } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";

const meta = {
  title: "Package/ui-connector/AuthGuard",
  component: AuthGuard,
  // subComponents: { Logo },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
      // <ConnectorProvider>
      <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
        <ModalProvider>
          <Story />
        </ModalProvider>
      </OrderlyApp>
      // </ConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
