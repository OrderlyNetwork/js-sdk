import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementCenterPage } from "@orderly.network/ui-notification";

/**
 * AnnouncementCenterPage component story
 * Displays a full-page announcement center with routing capabilities
 */
const meta: Meta<typeof AnnouncementCenterPage> = {
  title: "Package/ui-notification/AnnouncementCenterPage",
  component: AnnouncementCenterPage,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    routerAdapter: {
      control: "object",
      description: "Router adapter for handling navigation and route changes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default AnnouncementCenterPage display
 * Shows the announcement center page with default router behavior
 */
export const Default: Story = {
  args: {
    routerAdapter: {
      onRouteChange: (route) => {
        console.log("Route change:", route);
        // Default behavior: open in new tab
        if (route.href) {
          window.open(route.href, route.target || "_blank");
        }
      },
    },
  },
};
