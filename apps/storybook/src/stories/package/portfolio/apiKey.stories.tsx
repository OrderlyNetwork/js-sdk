import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  APIManagerModule,
  PortfolioLeftSidebarPath,
} from "@orderly.network/portfolio";
import { PortfolioLayout } from "../../../components/layout";

const meta: Meta<typeof APIManagerModule.APIManagerPage> = {
  title: "Package/portfolio/APIKey",
  component: APIManagerModule.APIManagerPage,
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
  render: (e) => {
    return (
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.ApiKey}>
        <APIManagerModule.APIManagerPage />
      </PortfolioLayout>
    );
  },
};
