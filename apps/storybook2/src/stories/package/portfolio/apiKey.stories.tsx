import type { Meta, StoryObj } from "@storybook/react";
import {
  APIManagerModule,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";

const meta: Meta<typeof APIManagerModule.APIManagerPage> = {
  title: "Package/Portfolio/APIKey",
  component: APIManagerModule.APIManagerPage,
  subcomponents: {},
  parameters: {},
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const Layout: Story = {
  render: (e) => {
    return (
      <PortfolioLayoutWidget>
        <APIManagerModule.APIManagerPage />
      </PortfolioLayoutWidget>
    );
  },
};
