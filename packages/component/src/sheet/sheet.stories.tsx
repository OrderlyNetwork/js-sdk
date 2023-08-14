import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { SimpleSheet } from ".";

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
