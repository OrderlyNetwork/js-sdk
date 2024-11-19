import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { PaginationItems } from "@orderly.network/ui";
import { useArgs } from "@storybook/preview-api";

const meta = {
  title: "Base/Pagination",
  component: PaginationItems,
  // subcomponents: { SelectItem },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    // size: {
    //   options: ["sm", "md", "lg"],
    //   control: { type: "inline-radio" },
    // },
    pageTotal: {
      control: {
        type: "number",
      },
    },
    page: {
      control: {
        type: "number",
      },
    },
    count: {
      control: {
        type: "number",
      },
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    pageTotal: 10,
    page: 1,
    count: 10,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // render: (args) => {
    // const [_, updateArgs, resetArgs] = useArgs();
    // return (
    //   <PaginationItems
    //     {...args}
    //     onPageChange={(page) => {
    //       updateArgs({ page });
    //     }}
    //   />
    // );
  // },
};
