import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  modal,
  Sheet,
  ModalProvider,
  registerSimpleSheet,
  SimpleSheet,
} from "@veltodefi/ui";

const meta = {
  title: "Base/Sheet",
  component: Sheet,
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
  argTypes: {},
  args: {
    // open: true,
    // title: "Title",
    // size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CommandStyle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          Open
        </Button>

        <SimpleSheet title="Demo" open={open} onOpenChange={setOpen}>
          SimpleSheet
        </SimpleSheet>
      </div>
    );
  },
};
