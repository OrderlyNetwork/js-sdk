import type { Meta, StoryObj } from "@storybook/react";
import {OrderEntryWidget} from "@orderly.network/ui-order-entry";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyApp } from "@orderly.network/react-app";

const meta = {
    title: "Package/ui-orderEntry",
    component: OrderEntryWidget,
    decorators: [
        (Story) => (
          <ConnectorProvider>
            <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
              <Story />
            </OrderlyApp>
          </ConnectorProvider>
        ),
      ],
} satisfies Meta<typeof OrderEntryWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
    args: {
    },
} satisfies Story;
