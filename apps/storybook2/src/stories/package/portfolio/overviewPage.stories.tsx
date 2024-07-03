import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { OverviewModule, PortfolioLayoutWidget, } from "@orderly.network/portfolio";

import { OrderlyApp } from "@orderly.network/react-app";
import { Box, Card } from "@orderly.network/ui";
import { fn } from "@storybook/test";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { Scaffold } from "@orderly.network/ui-scaffold";

const meta = {
  title: "Package/Portfolio/Overview",
  component: OverviewModule.OverviewPage,
  subcomponents: {
    Assets: OverviewModule.AssetWidget,
    DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
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
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    p: {
      control: {
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    p: 5,
    // py: 2,
  },
} satisfies Meta<typeof OverviewModule.OverviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;



export const Default: Story = {
  render: (args) => {
    return <PortfolioLayoutWidget>
      <OverviewModule.OverviewPage />
    </PortfolioLayoutWidget>
  },
}
