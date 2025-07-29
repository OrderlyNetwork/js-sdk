import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  OverviewModule,
  PortfolioLeftSidebarPath,
} from "@orderly.network/portfolio";
import { Box, Card, Flex, Grid } from "@orderly.network/ui";
import { DataViewer } from "../../../components/dataViewer";
import { PortfolioLayout } from "../../../components/layout";

const { usePerformanceScript } = OverviewModule;

const meta: Meta<typeof OverviewModule.OverviewPage> = {
  title: "Package/portfolio/Overview",
  component: OverviewModule.OverviewPage,
  subcomponents: {
    Assets: OverviewModule.AssetWidget,
    DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  },
  argTypes: {
    p: {
      control: {
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  render: () => <OverviewModule.OverviewPage />,
};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    return (
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.Overview}>
        <OverviewModule.OverviewPage />
      </PortfolioLayout>
    );
  },
};

export const Assets: Story = {
  render: (args) => {
    return <OverviewModule.AssetWidget {...args} />;
  },
  args: {
    // connected: false,
    // onConnectWallet: fn(),
    // onWithdraw: fn(),
    // onDeposit: fn(),
    // onLeverageEdit: fn(),
  },
  decorators: [
    (Story) => (
      <Flex
        justify={"center"}
        itemAlign={"center"}
        className="oui-h-screen oui-w-full"
      >
        <Box width={"580px"} pt={5}>
          <Story />
        </Box>
      </Flex>
    ),
  ],
};

export const AssetHistory: Story = {
  render: () => {
    return (
      <OverviewModule.AssetHistoryWidget></OverviewModule.AssetHistoryWidget>
    );
  },

  decorators: [
    (Story) => (
      <Card intensity={900}>
        <Story />
      </Card>
    ),
  ],
};

// export const Performance: Story = {
//   render: (args) => {
//     return (
//       <OverviewModule.PerformanceWidget></OverviewModule.PerformanceWidget>
//     );
//   },

//   decorators: [
//     (Story) => (
//       <Flex
//         justify={"center"}
//         itemAlign={"center"}
//         className="oui-w-full oui-h-screen"
//       >
//         <Box width={"880px"}>
//           <Story />
//         </Box>
//       </Flex>
//     ),
//   ],
// };

export const PerformanceAndData: Story = {
  render: (args) => {
    const state = usePerformanceScript();

    return (
      <Grid cols={2} gapX={2}>
        <div>
          <OverviewModule.PerformanceUI {...state} />
        </div>

        <div>
          <DataViewer data={state} />
        </div>
      </Grid>
    );
  },

  decorators: [
    (Story) => (
      <OverviewModule.OverviewContextProvider>
        <Story />
      </OverviewModule.OverviewContextProvider>
    ),
  ],
};

// export const AssetHistoryChart: Story = {
//   render: (args) => {
//     return (
//       <OverviewModule.AssetsChartWidget></OverviewModule.AssetsChartWidget>
//     );
//   },

//   decorators: [
//     (Story) => (
//       <Box width={"580px"}>
//         <Story />
//       </Box>
//     ),
//   ],
// };

export const FundingHistory: Story = {
  render: (args) => {
    return (
      <OverviewModule.FundingHistoryWidget></OverviewModule.FundingHistoryWidget>
    );
  },
  decorators: [
    (Story) => (
      <Box height={"550px"} className="oui-bg-base-9">
        <Story />
      </Box>
    ),
  ],
};

export const DistributionHistory: Story = {
  render: (args) => {
    return (
      <OverviewModule.DistributionHistoryWidget></OverviewModule.DistributionHistoryWidget>
    );
  },
  decorators: [
    (Story) => (
      <Box height={"550px"} className="oui-bg-base-9">
        <OverviewModule.OverviewContextProvider>
          <Story />
        </OverviewModule.OverviewContextProvider>
      </Box>
    ),
  ],
};
