import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {
  FavoritesDropdownMenuWidget,
  FavoritesTabWidget
} from "@orderly.network/markets";
import { Box, Button, Flex } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import { MarketsType, useMarketList } from "@orderly.network/hooks";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });

const meta = {
  title: "Package/Markets/Favorites",
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
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
} satisfies Meta<typeof FavoritesDropdownMenuWidget>;

export default meta;
type Story = StoryObj<typeof meta>;


export const DropdownMenu: Story = {
  render: (args) => {
    const [data, favorite] = useMarketList(MarketsType.ALL);

    return <FavoritesDropdownMenuWidget
      row={{ symbol: 'PERP_BTC_USDC' }}
      favorite={favorite}>
      <Button>Show favorite dropdown menu</Button>
    </FavoritesDropdownMenuWidget>;
  },

  decorators: [
    (Story) => (
      <Box>
        <Story />
      </Box>
    ),
  ],
};

export const Tabs: Story = {
  render: (args) => {
    const [data, favorite] = useMarketList(MarketsType.ALL);

    return (<>
      <Flex direction='column' itemAlign='start' gapY={2} p={2}>
        <div>Small</div>
        <FavoritesTabWidget favorite={favorite} size="sm" />
        <div>Default</div>
        <FavoritesTabWidget favorite={favorite} />
      </Flex>
      </>)
  },

  decorators: [
    (Story) => (
      <Box intensity={900} >
        <Story />
      </Box>
    ),
  ],
};