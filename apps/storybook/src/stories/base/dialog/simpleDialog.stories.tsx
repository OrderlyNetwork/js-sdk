import { useState } from "react";
import { Button, SimpleDialog, Text } from "@kodiak-finance/orderly-ui";
import type { StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

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
