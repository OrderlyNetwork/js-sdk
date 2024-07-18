import type {Meta, StoryObj} from "@storybook/react";
import {OrderlyApp} from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { MarketsHomePage,MarketsHeaderWidget,MarketListWidget, FavoritesWidget,MarketsDataListWidget, MarketsProvider } from '@orderly.network/markets';
import { Box } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });


const meta = {
    title: "Package/Markets",
    component: MarketsHomePage,
    subcomponents: {
       
    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"} configStore={configStore}>
                    <Story/>
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],   
} satisfies Meta<typeof MarketsHomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};


export const Header: Story = {
    render: (args) => {
      return <MarketsHeaderWidget />
    },
  
    decorators: [
      (Story) => (
        <Box>
          <Story />
        </Box>
      ),
    ],
}

export const Favorites: Story = {
  render: (args) => {
    return <FavoritesWidget  />
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
}

export const AllMarkets: Story = {
  render: (args) => {
    return <MarketListWidget type="all"  sortKey="24h_amount" sortOrder="desc" />
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
}
  
export const NewListings: Story = {
    render: (args) => {
      return <MarketListWidget type="new"  sortKey="created_time" sortOrder="desc" />
    },
  
    decorators: [
      (Story) => (
        <Box>
          <Story />
        </Box>
      ),
    ],
}
  
  
export const DataList: Story = {
  render: (args) => {
    return <MarketsProvider><MarketsDataListWidget /></MarketsProvider> 
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
}