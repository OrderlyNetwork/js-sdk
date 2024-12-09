import type { Meta, StoryObj } from "@storybook/react";
import {
  FavoritesDropdownMenuWidget,
  FavoritesTabWidget,
} from "@orderly.network/markets";
import { Box, Button, Flex } from "@orderly.network/ui";
import { MarketsType, useMarkets } from "@orderly.network/hooks";

const meta: Meta<typeof FavoritesDropdownMenuWidget> = {
  title: "Package/markets/Favorites",
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const decorators = [
  (Story: any) => (
    <Box width={500}>
      <Story />
    </Box>
  ),
];

export const DropdownMenu: Story = {
  render: (args) => {
    const [data, favorite] = useMarkets(MarketsType.ALL);

    return (
      <FavoritesDropdownMenuWidget
        row={{ symbol: "PERP_BTC_USDC" }}
        favorite={favorite}
      >
        <Button>Show favorite dropdown menu</Button>
      </FavoritesDropdownMenuWidget>
    );
  },

  decorators,
};

export const Tabs: Story = {
  render: (args) => {
    const [data, favorite] = useMarkets(MarketsType.ALL);

    return (
      <>
        <Flex direction="column" itemAlign="start" gapY={2} p={2}>
          <div>Small</div>
          <Box width={400} intensity={900} p={3}>
            <FavoritesTabWidget favorite={favorite} size="sm" />
          </Box>

          <div>Default</div>
          <Box width={600} intensity={900} p={3}>
            <FavoritesTabWidget favorite={favorite} />
          </Box>
        </Flex>
      </>
    );
  },

  decorators,
};
