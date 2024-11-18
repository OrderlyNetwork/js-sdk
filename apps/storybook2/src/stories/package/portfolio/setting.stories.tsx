import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  PortfolioLayoutWidget,
  SettingModule,
} from "@orderly.network/portfolio";

const meta: Meta<typeof SettingModule.SettingPage> = {
  title: "Package/Portfolio/setting",
  component: SettingModule.SettingPage,
  subcomponents: {},
  parameters: {},
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const Layout: Story = {
  render: () => {
    const [currentPath, setCurrentPath] = useState("/portfolio/apiKey");
    return (
      <PortfolioLayoutWidget
        // items={[]}
        routerAdapter={{
          onRouteChange: (op) => {
            console.log("routerAdapter", op);
            setCurrentPath(op.href);
          },
          // currentPath: currentPath
        }}
        leftSideProps={{
          current: currentPath,
        }}
      >
        <SettingModule.SettingPage />
      </PortfolioLayoutWidget>
    );
  },
};
