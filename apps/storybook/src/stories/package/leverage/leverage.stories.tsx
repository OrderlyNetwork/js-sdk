import { Box, Button, modal } from "@kodiak-finance/orderly-ui";
import {
  LeverageEditor,
  LeverageHeader,
  LeverageSlider,
  LeverageWidgetWithDialogId,
  useLeverageScript,
} from "@kodiak-finance/orderly-ui-leverage";
import type { Meta, StoryObj } from "@storybook/react-vite";

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
