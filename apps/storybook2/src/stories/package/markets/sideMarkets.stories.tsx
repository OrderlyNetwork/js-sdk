import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {
  ExpandMarketsWidget,
  FavoritesListWidget,
  MarketsListWidget,
  RecentListWidget,
  SideMarketsWidget,
} from "@orderly.network/markets";
import { Box, cn } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import { useState } from "react";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });


const decorators = [(Story: any) => (
  <Box width={280} height={600} intensity={900}>
    <Story />
  </Box>
)]

const meta = {
  title: "Package/Markets/SideMarkets",
  subcomponents: {},
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
          configStore={configStore}
        >
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
} satisfies Meta<typeof ExpandMarketsWidget>;

export default meta;
type Story = StoryObj<typeof meta>;



export const SideMarkets: Story = {
  render: (args) => {
    const [collapsed, setCollapsed] = useState(false);
    const width = collapsed ? 70 : 280

    return (
      <Box
        width={width}
        height={600}
        intensity={900}
        pt={3}
        r="2xl"
        className="oui-transition-all oui-duration-300"
      >
        <SideMarketsWidget
          collapsed={collapsed}
          onCollapse={setCollapsed}
          onSymbolChange={(symbol) => {
            console.log('onSymbolChange', symbol);
          }}
        />
      </Box>
    )
  },
  decorators: []
  // decorators:[(Story: any) => (
  //   <Box height={600} intensity={900}>
  //     <Story />
  //   </Box>
  // )]
};

export const ExpandMarkets: Story = {
  render: (args) => {
    return (
      <ExpandMarketsWidget
        onSymbolChange={(symbol) => {
          console.log('onSymbolChange', symbol);
        }}
      />)
  },
  decorators
};

export const CollapseMarkets: Story = {
  render: (args) => {
    return <MarketsListWidget
      type="all"
      sortKey="24h_amount"
      sortOrder="desc"
      collapsed={true}
    />
  },
  decorators: [
    (Story) => (
      <Box r="2xl" py={5} width={70} height={600} intensity={900}>
        <Story />
      </Box>
    ),
  ],
};


export const Favorites: Story = {
  render: (args) => {
    return <FavoritesListWidget />
  },
  decorators
};

export const Recent: Story = {
  render: (args) => {
    return <RecentListWidget />
  },
  decorators
};

export const All: Story = {
  render: (args) => {
    return <MarketsListWidget type="all" sortKey="24h_amount" sortOrder="desc" />
  },
  decorators
};