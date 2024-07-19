import type { Meta, StoryObj } from "@storybook/react";
import { FeeTierModule, PortfolioLayoutWidget, } from "@orderly.network/portfolio";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box } from "@orderly.network/ui";
import { ConnectorProvider } from "@orderly.network/web3-onboard";

const meta = {
  title: "Package/Portfolio/FeeTierPage",
  component: FeeTierModule.FeeTierPage,
  subcomponents: {

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
  parameters: {
    layout: "centered",
  },
  argTypes: {
    p: {
      control: {
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
    },
  },
  args: {
    p: 5,
  },
} satisfies Meta<typeof FeeTierModule.FeeTierPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};


export const Layout: Story = {
  render: () => {
    return <PortfolioLayoutWidget>
      <FeeTierModule.FeeTierPage />
    </PortfolioLayoutWidget>
  },
}