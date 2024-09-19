import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {
  ExpandMarketsWidget,
  FavoritesListWidget,
  MarketsListWidget,
  RecentListWidget,
  CollapseMarketsWidget,
  SideMarketsWidget
} from "@orderly.network/markets";
import { Box } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });


const decorators = [(Story: any) => (
  <Box r="2xl" py={6} width={280} intensity={900}>
    <Story />
  </Box>
),]

const meta = {
  title: "Package/Markets/Markets",
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
    return <Box height={600}><SideMarketsWidget /></Box>
  },
  decorators:[]
};

export const ExpandMarkets: Story = {
  render: (args) => {
    return <Box height={600}><ExpandMarketsWidget /></Box>
  },
  decorators
};

export const CollapseMarkets: Story = {
  render: (args) => {
    return <CollapseMarketsWidget />
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
    return <MarketsListWidget type="all" sortKey="24h_change" sortOrder="desc" />
  },
  decorators
};