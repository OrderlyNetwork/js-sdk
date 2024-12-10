import type { Meta, StoryObj } from "@storybook/react";
import { AdditionalInfoWidget } from "@orderly.network/ui-order-entry";
import { Box } from "@orderly.network/ui";
import { useState } from "react";

const meta: Meta<typeof AdditionalInfoWidget> = {
  title: "Package/ui-order-entry/additional",
  component: AdditionalInfoWidget,
  decorators: [
    (Story) => (
      <Box width={"215px"} r={"lg"} intensity={700} p={3}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {
  render: () => {
    const [pinned, setPinned] = useState(false);
    const [needConfirm, setNeedConfirm] = useState(false);
    const [hidden, setHidden] = useState(false);
    return (
      <AdditionalInfoWidget
        pinned={pinned}
        setPinned={setPinned}
        needConfirm={needConfirm}
        setNeedConfirm={setNeedConfirm}
        hidden={hidden}
        setHidden={setHidden}
      />
    );
  },
};
