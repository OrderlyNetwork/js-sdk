import type { Meta, StoryObj } from "@storybook/react";
import { PositionsModule, } from "@orderly.network/portfolio";
import { OrderlyApp } from "@orderly.network/react-app";
// import {Box} from "@orderly.network/ui";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { Flex, Text, Divider } from "@orderly.network/ui";


const meta = {
  title: "Package/Portfolio/Positions",
  component: PositionsModule.PositionsPage,
  subcomponents: {

  },
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
            <Story />
        </OrderlyApp>
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
} satisfies Meta<typeof PositionsModule.PositionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};
