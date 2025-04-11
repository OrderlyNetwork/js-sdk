import type { Meta, StoryObj } from "@storybook/react";
import {
  ExpandMarketsWidget,
  FavoritesListWidget,
  MarketsListWidget,
  RecentListWidget,
  DropDownMarketsWidget,
  useDropDownMarketsColumns,
} from "@orderly.network/markets";
import { Box, Button } from "@orderly.network/ui";

const decorators = [
  (Story: any) => (
    <Box height={500} width={429} intensity={800}>
      <Story />
    </Box>
  ),
];

const meta: Meta<typeof ExpandMarketsWidget> = {
  title: "Package/markets/DropDownMarkets",
  subcomponents: {},
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DropDownMarkets: Story = {
  render: (args) => {
    return (
      <DropDownMarketsWidget
        contentClassName="oui-w-[429px] oui-h-[496px]"
        symbol="PERP_BTC_USDC"
        onSymbolChange={(symbol) => {
          console.log("onSymbolChange", symbol);
        }}
      >
        <Button>Show DropDown markets</Button>
      </DropDownMarketsWidget>
    );
  },
  decorators: [],
};

export const Favorites: Story = {
  render: (args) => {
    return (
      <Box pt={2}>
        <FavoritesListWidget
          getColumns={useDropDownMarketsColumns()}
          tableClassNames={{
            root: "!oui-bg-base-8",
            scroll: "oui-pb-5 oui-px-1",
          }}
          rowClassName="!oui-h-[34px]"
        />
      </Box>
    );
  },
  decorators,
};

export const Recent: Story = {
  render: (args) => {
    return (
      <RecentListWidget
        getColumns={useDropDownMarketsColumns()}
        tableClassNames={{
          root: "!oui-bg-base-8",
          scroll: "oui-pb-5 oui-px-1",
        }}
        rowClassName="!oui-h-[34px]"
      />
    );
  },
  decorators,
};

export const All: Story = {
  render: (args) => {
    return (
      <MarketsListWidget
        type="all"
        sortKey="24h_amount"
        sortOrder="desc"
        getColumns={useDropDownMarketsColumns()}
        tableClassNames={{
          root: "!oui-bg-base-8",
          scroll: "oui-pb-5 oui-px-1",
        }}
        rowClassName="!oui-h-[34px]"
      />
    );
  },
  decorators,
};
