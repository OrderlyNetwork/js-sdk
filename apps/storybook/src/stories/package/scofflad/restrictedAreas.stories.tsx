import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@orderly.network/ui";
import { RestrictedInfoWidget } from "@orderly.network/ui-scaffold";

const meta: Meta<typeof RestrictedInfoWidget> = {
  title: "Package/ui-scaffold/RestrictedAreas",
  component: RestrictedInfoWidget,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.FC) => (
      <Box intensity={900}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
