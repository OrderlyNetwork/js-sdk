import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@veltodefi/ui";
import { AdditionalInfo } from "@veltodefi/ui-order-entry";

const meta: Meta<typeof AdditionalInfo> = {
  title: "Package/ui-order-entry/additional",
  component: AdditionalInfo,
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
      <AdditionalInfo
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
