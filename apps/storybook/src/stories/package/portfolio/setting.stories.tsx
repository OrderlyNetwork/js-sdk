import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PortfolioLeftSidebarPath,
  SettingModule,
} from "@orderly.network/portfolio";
import { PortfolioLayout } from "../../../components/layout";

const meta: Meta<typeof SettingModule.SettingPage> = {
  title: "Package/portfolio/Setting",
  component: SettingModule.SettingPage,
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
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.Setting}>
        <SettingModule.SettingPage />
      </PortfolioLayout>
    );
  },
};
