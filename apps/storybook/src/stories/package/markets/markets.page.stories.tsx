import type { Meta, StoryObj } from "@storybook/react";
import { i18n } from "@orderly.network/i18n";
import {
  MarketsHomePage,
  MarketsHeaderWidget,
  MarketsListFullWidget,
  FavoritesListFullWidget,
  FundingOverviewWidget,
  MarketsDataListWidget,
  MarketsProvider,
  FundingComparisonWidget,
} from "@orderly.network/markets";
import {
  useScreen,
  TradingIcon,
  BarChartIcon,
  PersonIcon,
  AssetIcon,
  BattleIcon,
  SettingFillIcon,
  TradingLeftNavIcon,
} from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout";

const meta: Meta<typeof MarketsHomePage> = {
  title: "Package/markets/HomePage",
  component: MarketsHomePage,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  parameters: {
    layout: "fullscreen",
  },
};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => {
    const { isMobile } = useScreen();
    return (
      <BaseLayout
        initialMenu="/markets"
        // hide top bar
        topBar={isMobile ? <></> : undefined}
      >
        <MarketsHomePage
          navProps={{
            leftNav: {
              menus: [
                // { name: i18n.t("common.trading"), href: "/", icon: <TradingIcon /> },
                // {
                //   name: i18n.t("common.markets"),
                //   href: "/markets",
                //   icon: <BarChartIcon />,
                // },
                // {
                //   name: i18n.t("common.portfolio"),
                //   href: "/portfolio",
                //   icon: <PersonIcon />,
                // },
                // {
                //   name: i18n.t("common.assets"),
                //   href: "/portfolio/assets",
                //   icon: <AssetIcon />,
                // },
                // {
                //   name: i18n.t("tradingLeaderboard.arena"),
                //   href: "/leaderboard",
                //   icon: <BattleIcon />,
                // },
                // {
                //   name: i18n.t("common.affiliate"),
                //   href: "/rewards/affiliate",
                //   icon: <img src="box-ani.gif" className="oui-w-6 oui-h-6" />,
                //   trailing: '<Tag text="Unlock @ $10K volume" />',
                // },
                // {
                //   name: i18n.t("common.tradingRewards"),
                //   href: "/rewards/trading",
                //   icon: (
                //     <TradingLeftNavIcon width={24} height={24} opacity={0.8} />
                //   ),
                // },
                // {
                //   name: i18n.t("common.settings"),
                //   href: "/portfolio/settings",
                //   icon: <SettingFillIcon color="white" opacity={0.8} />,
                // },
              ],
              twitterUrl: "https://twitter.com/OrderlyNetwork",
              telegramUrl: "https://t.me/orderlynetwork",
              discordUrl: "https://discord.com/invite/orderlynetwork",
              duneUrl: "https://dune.com/orderlynetwork",
              feedbackUrl: "https://orderly.network/feedback",
            },
          }}
        />
      </BaseLayout>
    );
  },
};

export const Header: Story = {
  render: (args) => {
    return <MarketsHeaderWidget />;
  },
};

export const Favorites: Story = {
  render: (args) => {
    return <FavoritesListFullWidget />;
  },
};

export const AllMarkets: Story = {
  render: (args) => {
    return (
      <MarketsListFullWidget
        type="all"
        initialSort={{ sortKey: "24h_amount", sortOrder: "desc" }}
      />
    );
  },
};

export const NewListings: Story = {
  render: (args) => {
    return (
      <MarketsListFullWidget
        type="new"
        initialSort={{ sortKey: "created_time", sortOrder: "desc" }}
      />
    );
  },
};

export const DataList: Story = {
  render: (args) => {
    return (
      <MarketsProvider>
        <MarketsDataListWidget />
      </MarketsProvider>
    );
  },
};

export const FundingHistory: Story = {
  render: (args) => {
    return <FundingOverviewWidget />;
  },
};

export const FundingComparison: Story = {
  render: (args) => {
    return <FundingComparisonWidget />;
  },
};
