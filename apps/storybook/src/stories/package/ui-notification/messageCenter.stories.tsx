import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementType } from "@orderly.network/types";
import {
  AnnouncementCenterUI,
  MsgItem,
} from "@orderly.network/ui-notification";

/**
 * MessageCenter component stories
 * Displays a message center with notification items
 */
const meta: Meta<typeof AnnouncementCenterUI> = {
  title: "Package/ui-notification/MessageCenter",
  component: AnnouncementCenterUI,
  subcomponents: { MsgItem }, // 👈 Adds the MsgItem component as a subcomponent
  parameters: {
    layout: "centered",
  },
  argTypes: {
    dataSource: {
      control: "object",
      description: "The data source of the message center",
    },
  },
  //   decorators:
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default MessageCenter display
 */
export const Default: Story = {
  args: {
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
