import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementType } from "@orderly.network/types";
import { MsgItem } from "@orderly.network/ui-notification";

/**
 * MsgItem component stories
 * Displays a single notification message item with different types
 */
const meta: Meta<typeof MsgItem> = {
  title: "Package/ui-notification/MsgItem",
  component: MsgItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: Object.values(AnnouncementType),
      description: "The type of the message",
    },
    expanded: {
      control: "boolean",
      description: "Whether the message is expanded or collapsed",
    },

    description: {
      control: "text",
      description: "The description/content of the message",
    },
    url: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive message item
 * Use the controls panel to customize the message type, title, description, and expanded state
 */
export const Default: Story = {
  args: {
    type: AnnouncementType.Campaign,
    description:
      "with full market support, including spot and perpetual contracts (if applicable).",
    expanded: false,
  },
};
