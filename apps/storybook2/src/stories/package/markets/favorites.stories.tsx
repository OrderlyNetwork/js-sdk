import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {
  FavoritesDropdownMenuWidget
} from "@orderly.network/markets";
import { Box, Button } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";

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
    return <FavoritesDropdownMenuWidget
      row={{ symbol: 'PERP_BTC_USDC' }}
      favorite={{ favoriteTabs: [{ name: "Popular", id: 1 }] } as any}>
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
