import type { Meta, StoryObj } from "@storybook/react";
import {
  LeverageWidgetId,
  LeverageEditor,
  LeverageHeader,
  LeverageSlider,
  useLeverageScript,
} from "@orderly.network/ui-leverage";
import { Box, Button, modal } from "@orderly.network/ui";

const meta: Meta<typeof LeverageEditor> = {
  title: "Package/ui-leverage/LeverageEditor",
  component: LeverageEditor,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CommandStyle: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          modal.show(LeverageWidgetId, { currentLeverage: 5 });
        }}
      >
        Adjust leverage
      </Button>
    );
  },
};

export const NoDialog: Story = {
  render: () => {
    const { currentLeverage, onSave, ...rest } = useLeverageScript();

    return (
      <Box width={500}>
        <LeverageHeader currentLeverage={currentLeverage} />
        <LeverageSlider onValueCommit={onSave} {...rest} />
      </Box>
    );
  },
};
