import type {Meta, StoryObj} from "@storybook/react";
import {OrderlyApp} from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { MarketsPage,MarketsHeaderWidget,MarketListWidget, FavoritesWidget,MarketsDataListWidget } from '@orderly.network/markets';
import { Box } from "@orderly.network/ui";

const meta = {
    title: "Package/Markets/Header",
    component: MarketsPage,
    subcomponents: {
       
    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
                    <Story/>
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],   
} satisfies Meta<typeof MarketsPage>;

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
    return <MarketListWidget  />
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
      return <MarketListWidget type="new"/>
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
    return <MarketsDataListWidget />
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
}