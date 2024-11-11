import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  FavoritesDropdownMenuWidget,
  FavoritesTabWidget
} from "@orderly.network/markets";
import { Box, Button, Flex } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import { MarketsType, useMarkets } from "@orderly.network/hooks";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });

const meta = {
  title: "Package/Markets/Favorites",
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
} satisfies Meta<typeof FavoritesDropdownMenuWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorators = [(Story:any) => (
  <Box width={500} >
    <Story />
  </Box>
)]


export const DropdownMenu: Story = {
  render: (args) => {
    const [data, favorite] = useMarkets(MarketsType.ALL);

    return <FavoritesDropdownMenuWidget
      row={{ symbol: 'PERP_BTC_USDC' }}
      favorite={favorite}>
      <Button>Show favorite dropdown menu</Button>
    </FavoritesDropdownMenuWidget>;
  },

  decorators
};

export const Tabs: Story = {
  render: (args) => {
    const [data, favorite] = useMarkets(MarketsType.ALL);

    return (<>
      <Flex direction='column' itemAlign='start' gapY={2} p={2}>
        <div>Small</div>
        <Box width={400} intensity={900} p={3} >
          <FavoritesTabWidget favorite={favorite} size="sm" />
        </Box>

        <div>Default</div>        
        <Box width={600} intensity={900} p={3}>
          <FavoritesTabWidget favorite={favorite} />
        </Box>
      </Flex>
      </>)
  },

  decorators
};