import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@orderly.network/ui";
import { SideNavbarWidget } from "@orderly.network/ui-scaffold";
import { leftSidebarMenus } from "./data";

const meta: Meta<typeof SideNavbarWidget> = {
  title: "Package/ui-scaffold/SideNavbar",
  component: SideNavbarWidget,
  // subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {
    items: leftSidebarMenus,
    open: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Box width={args.open ? "160px" : "75px"} intensity={900} p={4} r={"2xl"}>
        <SideNavbarWidget {...args} />
      </Box>
    );
  },
};
