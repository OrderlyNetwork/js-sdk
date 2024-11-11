import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  ExpandMarketsWidget,
  FavoritesListWidget,
  MarketsListWidget,
  RecentListWidget,
  SideMarketsWidget,
} from "@orderly.network/markets";
import { Box } from "@orderly.network/ui";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore";
import { useState } from "react";

const networkId = "testnet";
const configStore = new CustomConfigStore({
  networkId,
  brokerId: "orderly",
  brokerName: "Orderly",
  env: "staging",
});

const decorators = [
  (Story: any) => (
    <Box width={280} height={600} intensity={900}>
      <Story />
    </Box>
  ),
];

const meta: Meta<typeof ExpandMarketsWidget> = {
  title: "Package/Markets/SideMarkets",
  subcomponents: {},
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider networkId="testnet" configStore={configStore}>
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
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
        type="all"
        sortKey="24h_amount"
        sortOrder="desc"
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

export const All: Story = {
  render: (args) => {
    return (
      <MarketsListWidget
        type="all"
        sortKey="24h_amount"
        sortOrder="desc"
        tableClassNames={{
          scroll: "oui-px-1",
        }}
      />
    );
  },
  decorators,
};
