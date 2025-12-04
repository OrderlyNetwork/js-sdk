import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementType } from "@veltodefi/types";
import { NotificationUI } from "@veltodefi/ui-notification";

/**
 * Notification component story
 * Displays notification UI with header, content, and footer with navigation controls
 */
const meta: Meta<typeof NotificationUI> = {
  title: "Package/ui-notification/Notification",
  component: NotificationUI,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Custom CSS class name for the notification container",
    },
    dataSource: {
      control: "object",
      description: "The data source of the notification",
    },
  },
  args: {
    className: "",
    dataSource: [
      {
        announcement_id: 1,
        message: "Token Delisting Notice",
        type: AnnouncementType.Delisting,
      },
      {
        announcement_id: 2,
        message: "New Token Listed on ",
        type: AnnouncementType.Listing,
      },
      {
        announcement_id: 3,
        message: "Maintenance",
        type: AnnouncementType.Maintenance,
      },
      {
        announcement_id: 4,
        message: "Latest Campaign is coming",
        type: AnnouncementType.Campaign,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default interactive notification display
 * Shows notification with header displaying campaign info,
 * navigation controls for multiple notifications (1/4),
 * and close all action button
 */
export const Default: Story = {
  args: {},
};
