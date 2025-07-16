import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, modal } from "@orderly.network/ui";
import {
  LeverageWidgetWithDialogId,
  LeverageEditor,
  LeverageHeader,
  LeverageSlider,
  useLeverageScript,
} from "@orderly.network/ui-leverage";

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
          modal.show(LeverageWidgetWithDialogId, { currentLeverage: 5 });
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
