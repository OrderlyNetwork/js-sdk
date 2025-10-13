import { Box } from "@kodiak-finance/orderly-ui";
import { SideNavbarWidget } from "@kodiak-finance/orderly-ui-scaffold";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { leftSidebarMenus } from "./data";

const meta: Meta<typeof SideNavbarWidget> = {
  title: "Package/ui-scaffold/SideNavbar",
  component: SideNavbarWidget,
  // subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
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
