import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button, SimpleDialog, Text } from "@orderly.network/ui";
import { useState } from "react";

const meta = {
  title: "Base/Dialog/SimpleDialog",
  component: SimpleDialog,
  parameters: {
    layout: "centered",
  },
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
    open: false,
    title: "Title",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actions: {
      primary: {
        label: "Confirm",
        onClick: fn(),
      },
      secondary: {
        label: "Cancel",
        onClick: fn(),
      },
    },
  },
  render: (arg) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button size={"lg"} onClick={(e) => setOpen((e) => !e)}>
          Open
        </Button>
        <SimpleDialog open={open} onOpenChange={setOpen} title="Simple dialog">
          <Text>Simple dialog</Text>
        </SimpleDialog>
      </>
    );
  },
};
