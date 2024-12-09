import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  modal,
  Sheet,
  ModalProvider,
  registerSimpleSheet,
  SimpleSheet,
} from "@orderly.network/ui";
import { useState } from "react";

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
