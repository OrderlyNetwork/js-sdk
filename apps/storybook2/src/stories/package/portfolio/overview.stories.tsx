import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { OverviewModule, PortfolioLayoutWidget, } from "@orderly.network/portfolio";

import { OrderlyApp } from "@orderly.network/react-app";
import { Box, Card, Flex } from "@orderly.network/ui";
import { fn } from "@storybook/test";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useMemo } from "react";

const meta = {
  title: "Package/Portfolio/Overview",
  component: OverviewModule.OverviewPage,
  subcomponents: {
    Assets: OverviewModule.AssetWidget,
    DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  },
  decorators: [
    (Story) => (
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

// export const Page: Story = {};


export const Assets: Story = {
  render: (args) => {
    return <OverviewModule.AssetWidget {...args} />;
  },
  args: {
    // connected: false,
    // onConnectWallet: fn(),
    // onWithdraw: fn(),
    // onDeposit: fn(),
    // onLeverageEdit: fn(),
  },
  decorators: [
    (Story) => (
      <Flex justify={'center'} itemAlign={'center'} className="oui-w-full oui-h-full" width={'580px'}>
        <Story />
      </Flex>
    ),
  ],
};

export const AssetHistory: Story = {
  render: () => {
    return <OverviewModule.AssetHistoryWidget></OverviewModule.AssetHistoryWidget>
  },

  decorators: [
    (Story) => (
      <Card intensity={900}>
        <Story />
      </Card>
    ),
  ],

}

export const Performance: Story = {
  render: (args) => {
    return <OverviewModule.PerformanceWidget></OverviewModule.PerformanceWidget>
  },

  decorators: [
    (Story) => (
      <Box width={'880px'}>
        <Story />
      </Box>
    ),
  ],
}

export const AssetHistoryChart: Story = {
  render: (args) => {
    return <OverviewModule.AssetsChartWidget></OverviewModule.AssetsChartWidget>
  },

  decorators: [
    (Story) => (
      <Box width={'580px'}>
        <Story />
      </Box>
    ),
  ],
}

export const FundingHistory: Story = {
  render: (args) => {
    return <OverviewModule.FundingHistoryWidget></OverviewModule.FundingHistoryWidget>
  },
  decorators: [
    (Story) => (
      <Box height={'550px'} className="oui-bg-base-9">
        <Story />
      </Box>
    ),
  ],
}

export const DistributionHistory: Story = {
  render: (args) => {
    return <OverviewModule.DistributionHistoryWidget></OverviewModule.DistributionHistoryWidget>
  },
  decorators: [
    (Story) => (
      <Box height={'550px'} className="oui-bg-base-9">
        <Story />
      </Box>
    ),
  ],
}


// export const FundingHistoryDataGrid: Story = {
//     render: (args) => {
//         return <OverviewModule.FundingHistoryWidget></OverviewModule.FundingHistoryWidget>
//     },
//     decorators: [
//         (Story) => (
//             <Box height={'550px'} className="oui-bg-base-9" >
//                 <Story/>
//             </Box>
//         ),
//     ],
// }


export const Page: Story = {
  render: () => {
   
    return <PortfolioLayoutWidget routerAdapter={{
      onRouteChange: (op) => {
        console.log("router adapter", op);
      }
    }}
    
    // leftSideProps={{
    //   current: '/portfolio',
    //   items: items,
    // }}
    >
      <OverviewModule.OverviewPage />
    </PortfolioLayoutWidget>
  },
}
