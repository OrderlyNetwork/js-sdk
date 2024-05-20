import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button, TriggerDialog } from "@orderly.network/ui";

const meta = {
  title: "Base/Dialog/TriggerDialog",
  component: TriggerDialog,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
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
  args: {
    trigger: <Button>Trigger</Button>,
    children: "Dialog Content",
    // actions: {
    //   primary: {
    //     label: "Confirm",
    //     onClick: fn(),
    //   },
    //   secondary: {
    //     label: "Cancel",
    //     onClick: fn(),
    //   },
    // },
  },
};

export const Description: Story = {
  args: {
    trigger: <Button>Trigger</Button>,
    children: "Dialog Content",
    description: "Anyone who has this link will be able to view this.",
    // actions: {
    //   primary: {
    //     label: "Confirm",
    //     onClick: fn(),
    //   },
    //   secondary: {
    //     label: "Cancel",
    //     onClick: fn(),
    //   },
    // },
  },
};
