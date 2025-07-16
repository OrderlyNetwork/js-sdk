import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
// import { fn } from 'storybook/test';
import { PaginationItems } from "@orderly.network/ui";

const meta = {
  title: "Base/Pagination",
  component: PaginationItems,
  // subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
