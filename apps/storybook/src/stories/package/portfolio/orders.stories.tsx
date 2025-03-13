import type { Meta, StoryObj } from "@storybook/react";
import {
  OrdersModule,
  PortfolioLeftSidebarPath,
} from "@orderly.network/portfolio";
import { Box } from "@orderly.network/ui";
import { PortfolioLayout } from "../../../components/layout/portfolioLayout";
import config from "../../../config";

const meta: Meta<typeof OrdersModule.OrdersPage> = {
  title: "Package/portfolio/Orders",
  component: OrdersModule.OrdersPage,
  subcomponents: {},
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      p={6}
      pb={0}
      intensity={900}
      r="xl"
      width="100%"
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        // Make the table scroll instead of the page scroll
        height: "calc(100vh - 48px - 29px - 48px)",
      }}
    >
      {children}
    </Box>
  );
};

export const Page: Story = {
  render: () => (
    <Container>
      <OrdersModule.OrdersPage />
    </Container>
  ),
};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    return (
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.Orders}>
        <Container>
          <OrdersModule.OrdersPage
            sharePnLConfig={config.tradingPage.sharePnLConfig}
          />
        </Container>
      </PortfolioLayout>
    );
  },
};
