import type { StoryObj } from "@storybook/react-vite";
import { Box } from "@veltodefi/ui";
import {
  MaintenanceTipsUI,
  AccountMenuWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  Scaffold,
} from "@veltodefi/ui-scaffold";

const meta = {
  title: "Package/ui-scaffold/maintenanceTips",
  component: MaintenanceTipsUI,
  subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <Box intensity={900}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tipsContent:
      "Orderly will be temporarily unavailable for a scheduled upgrade from 11:30 PM (UTC) on June 28 to 12:30 AM (UTC) on June 29.",
    closeTips: () => {},
    showTips: true,
    showDialog: false,
    dialogContent: "test",
  },
};

export const SystemMaintenanceStatus: Story = {
  render: () => {
    return <Scaffold></Scaffold>;
  },
  args: {
    tipsContent:
      "Orderly will be temporarily unavailable for a scheduled upgrade from 11:30 PM (UTC) on June 28 to 12:30 AM (UTC) on June 29.",
    closeTips: () => {},
    showTips: true,
    showDialog: false,
    dialogContent: "test",
  },
};
