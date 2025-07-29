import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ExpandMarketsWidget,
  FavoritesListWidget,
  MarketsListWidget,
  RecentListWidget,
  SideMarketsWidget,
  NewListingListWidget,
  MarketsTabName,
} from "@orderly.network/markets";
import { Box } from "@orderly.network/ui";

const decorators = [
  (Story: any) => (
    <Box width={280} height={600} intensity={900}>
      <Story />
    </Box>
  ),
];

const meta: Meta<typeof ExpandMarketsWidget> = {
  title: "Package/markets/SideMarkets",
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SideMarkets: Story = {
  render: (args) => {
    const [collapsed, setCollapsed] = useState(false);
    const width = collapsed ? 70 : 280;

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
          symbol="PERP_BTC_USDC"
          onSymbolChange={(symbol) => {
            console.log("onSymbolChange", symbol);
          }}
        />
      </Box>
    );
  },
  decorators: [],
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
          console.log("onSymbolChange", symbol);
        }}
      />
    );
  },
  decorators,
};

export const CollapseMarkets: Story = {
  render: (args) => {
    return (
      <MarketsListWidget
        type={MarketsTabName.All}
        initialSort={{ sortKey: "24h_amount", sortOrder: "desc" }}
        collapsed={true}
      />
    );
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
    return (
      <FavoritesListWidget
        tableClassNames={{
          scroll: "oui-px-1",
        }}
      />
    );
  },
  decorators,
};

export const Recent: Story = {
  render: (args) => {
    return (
      <RecentListWidget
        tableClassNames={{
          scroll: "oui-px-1",
        }}
      />
    );
  },
  decorators,
};

export const NewListing: Story = {
  render: (args) => {
    return (
      <Box
        width={280}
        height={600}
        intensity={900}
        pt={3}
        r="2xl"
        className="oui-transition-all oui-duration-300"
      >
        <NewListingListWidget
          tableClassNames={{
            scroll: "oui-px-1",
          }}
        />
      </Box>
    );
  },
};

export const All: Story = {
  render: (args) => {
    return (
      <MarketsListWidget
        type={MarketsTabName.All}
        initialSort={{ sortKey: "24h_amount", sortOrder: "desc" }}
        tableClassNames={{
          scroll: "oui-px-1",
        }}
      />
    );
  },
  decorators,
};
