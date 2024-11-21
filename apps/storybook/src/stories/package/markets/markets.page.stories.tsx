import type { Meta, StoryObj } from "@storybook/react";
import {
  MarketsHomePage,
  MarketsHeaderWidget,
  MarketsListFullWidget,
  FavoritesListFullWidget,
  MarketsDataListWidget,
  MarketsProvider,
} from "@orderly.network/markets";
import { Box } from "@orderly.network/ui";

const meta: Meta<typeof MarketsHomePage> = {
  title: "Package/markets/HomePage",
  component: MarketsHomePage,
  parameters: {
    layout: "centered",
    
  },
};

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
      <MarketsListFullWidget
        type="new"
        sortKey="created_time"
        sortOrder="desc"
      />
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
