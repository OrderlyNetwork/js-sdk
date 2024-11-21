import type { Meta, StoryObj } from "@storybook/react";
import { AlertDialog, Button, modal, ModalProvider } from "@orderly.network/ui";

const meta = {
  title: "Base/Dialog/CommandStyle",
  component: AlertDialog,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    size: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: ["sm", "md", "lg"],
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
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
