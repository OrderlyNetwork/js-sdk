import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  ExpandMarketsWidget,
  FavoritesListWidget,
  MarketsListWidget,
  RecentListWidget,
  DropDownMarketsWidget,
  getDropDownMarketsColumns,
} from "@orderly.network/markets";
import { Box, Button } from "@orderly.network/ui";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore";

const configStore = new CustomConfigStore({
  networkId: "testnet",
  brokerId: "orderly",
  brokerName: "Orderly",
  env: "staging",
});

const decorators = [
  (Story: any) => (
    <Box height={500} width={429} intensity={800}>
      <Story />
    </Box>
  ),
];

const meta: Meta<typeof ExpandMarketsWidget> = {
  title: "Package/Markets/DropDownMarkets",
  subcomponents: {},
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider configStore={configStore}>
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
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
      <FavoritesListWidget
        getColumns={getDropDownMarketsColumns}
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

export const Recent: Story = {
  render: (args) => {
    return (
      <RecentListWidget
        getColumns={getDropDownMarketsColumns}
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
        getColumns={getDropDownMarketsColumns}
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
