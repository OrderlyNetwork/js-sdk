import { Box } from "@kodiak-finance/orderly-ui";
import { RestrictedInfoWidget } from "@kodiak-finance/orderly-ui-scaffold";
import type { Meta, StoryObj } from "@storybook/react-vite";

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
