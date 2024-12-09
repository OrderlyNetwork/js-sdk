import type { Meta, StoryObj } from "@storybook/react";
import {
  CardBase,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "@orderly.network/ui";

const meta: Meta<typeof CardBase> = {
  title: "Base/Layout/Card",
  component: CardBase,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    p: {
      control: {
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
    },
  },
  args: {
    p: 5,
    // py: 2,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <CardBase className="oui-min-w-[360px]">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </CardBase>
    );
  },
};

// export const Size:Story = {
//   args:{
//     className: 'oui-bg-red-100',
//     width: '100px',
//     height: '100px',
//   }
// }
