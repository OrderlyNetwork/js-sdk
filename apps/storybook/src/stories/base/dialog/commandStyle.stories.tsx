import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertDialog, Button, modal, ModalProvider } from "@veltodefi/ui";

const meta = {
  title: "Base/Dialog/CommandStyle",
  component: AlertDialog,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    size: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    open: true,
    title: "Title",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Button
        onClick={() => {
          modal.alert({
            title: "Title",
            message: "This is an alert dialog",
          });
        }}
      >
        Open alert dialog
      </Button>
    );
  },
};
