import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {  
  ExpandMarketsWidget,
  FavoritesListWidget
} from "@orderly.network/markets";
import { Box } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });

const meta = {
  title: "Package/Markets/Markets",
  subcomponents: {},
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp
          brokerId={"orderly"}
          brokerName={""}
          networkId={"testnet"}
          configStore={configStore}
        >
          <Box r="2xl" py={6} width={280} intensity={900}>
          <Story /></Box>
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
} satisfies Meta<typeof ExpandMarketsWidget>;

export default meta;
type Story = StoryObj<typeof meta>;


export const ExpandMarkets: Story = {
  render: (args) => {
    return <ExpandMarketsWidget />
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};

export const Favorites: Story = {
  render: (args) => {
    return <FavoritesListWidget />
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};