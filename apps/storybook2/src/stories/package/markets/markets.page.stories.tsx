import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  MarketsHomePage,
  MarketsHeaderWidget,
  MarketsListFullWidget,
  FavoritesListFullWidget,
  MarketsDataListWidget,
  MarketsProvider,
} from "@orderly.network/markets";
import { Box } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });

const meta = {
  title: "Package/Markets/HomePage",
  component: MarketsHomePage,
  subcomponents: {},
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyApp
          brokerId={"orderly"}
          brokerName={""}
          networkId={"testnet"}
          configStore={configStore}
        >
          <Story />
        </OrderlyApp>
      </WalletConnectorProvider>
    ),
  ],
} satisfies Meta<typeof MarketsHomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  args: {
    className: "oui-pb-10",
  },
  decorators: [
    (Story) => (
      <Box intensity={800}>
        <Story />
      </Box>
    ),
  ],
};

export const Header: Story = {
  render: (args) => {
    return <MarketsHeaderWidget />;
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
    return <FavoritesListFullWidget />;
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};

export const AllMarkets: Story = {
  render: (args) => {
    return (
      <MarketsListFullWidget type="all" sortKey="24h_amount" sortOrder="desc" />
    );
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};

export const NewListings: Story = {
  render: (args) => {
    return (
      <MarketsListFullWidget type="new" sortKey="created_time" sortOrder="desc" />
    );
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};

export const DataList: Story = {
  render: (args) => {
    return (
      <MarketsProvider>
        <MarketsDataListWidget />
      </MarketsProvider>
    );
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};
