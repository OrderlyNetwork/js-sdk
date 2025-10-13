import { Box } from "@kodiak-finance/orderly-ui";
import {
  AccountMenuWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  MaintenanceTipsUI,
  Scaffold,
} from "@kodiak-finance/orderly-ui-scaffold";
import type { StoryObj } from "@storybook/react-vite";

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
