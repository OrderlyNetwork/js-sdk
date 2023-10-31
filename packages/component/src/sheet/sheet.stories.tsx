import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import {
  ActionSheet,
  ActionSheetContent,
  Sheet,
  SheetContent,
  SheetTrigger,
  SimpleSheet,
} from ".";

const meta: Meta = {
  title: "Base/Sheet",
  component: SimpleSheet,
  //   parameters: {
  //     layout: "fullscreen",
  //   },
};

export default meta;

type Story = StoryObj<typeof SimpleSheet>;

export const Default: Story = {
  // description: "Description",
  //   args: {
  //     title: "Title",
  //     open: true,
  //     children: <div>sheet body</div>,
  //   },
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        <SimpleSheet
          {...args}
          title="Title"
          open={open}
          onClose={() => setOpen(false)}
        >
          <div>sheet body</div>
        </SimpleSheet>
      </>
    );
  },
};

export const ActionListview: Story = {
  render: (args) => {
    return (
      <ActionSheetContent
        actionSheets={[
          {
            label: "Action 1",
            value: "action1",
          },
          {
            label: "Action 2",
            value: "action2",
          },
          {
            label: "Action 3",
            value: "action3",
          },
          { label: "---", value: "---", type: "division" },
          {
            label: "Cancel",
            value: "cancel",
          },
        ]}
      />
    );
  },
};

export const ActionSheetStyle: Story = {
  render: (args) => {
    return (
      <ActionSheet
        onValueChange={(value) => {}}
        actionSheets={[
          {
            label: "Action 1",
            value: "action1",
          },
          {
            label: "Action 2",
            value: "action2",
          },
          {
            label: "Action 3",
            value: "action3",
          },
          { label: "---", value: "---", type: "division" },
          {
            label: "Cancel",
            value: "cancel",
          },
        ]}
      >
        <button>Open</button>
      </ActionSheet>
    );
  },
};
