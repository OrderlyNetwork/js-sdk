import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PortfolioLeftSidebarPath,
  HistoryModule,
} from "@orderly.network/portfolio";
import { PortfolioLayout } from "../../../components/layout/portfolioLayout";

const meta: Meta<typeof HistoryModule.HistoryPage> = {
  title: "Package/portfolio/History",
  component: HistoryModule.HistoryPage,
  subcomponents: {},
  parameters: {},
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    return (
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.History}>
        <HistoryModule.HistoryPage />
      </PortfolioLayout>
    );
  },
};
