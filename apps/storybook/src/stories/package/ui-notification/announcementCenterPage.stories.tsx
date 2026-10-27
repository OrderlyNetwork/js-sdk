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
    onRouteChange: {
      control: false,
      description: "Optional override for OrderlyAppProvider navigation",
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
  args: {},
};

/** Overrides the application callback for this page only. */
export const WithNavigationOverride: Story = {
  args: {
    onRouteChange: (route) => {
      if (route.target === "_blank") {
        window.open(route.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.assign(route.href);
      }
    },
  },
};
