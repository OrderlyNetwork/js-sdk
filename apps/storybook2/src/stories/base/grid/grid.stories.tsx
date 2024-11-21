import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { Box, Grid } from "@orderly.network/ui";

const meta: Meta<typeof Grid> = {
  title: "Base/Layout/Grid",
  component: Grid,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    //   layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    // py: 2,
    // direction: "row",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Grid {...args}>
        <Box className="oui-bg-red-100 oui-text-5xl">1</Box>
        <Box className="oui-bg-red-200 oui-text-5xl">2</Box>
        <Box className="oui-bg-red-300 oui-text-5xl">3</Box>
        <Box className="oui-bg-red-400 oui-text-5xl">4</Box>
        <Box className="oui-bg-red-500 oui-text-5xl">5</Box>
      </Grid>
    );
  },
  args: {
    gap: 5,
    // itemAlign: "center",
    // justify: "center",
    className: "oui-min-h-[300px]",
    cols: 3,
  },
};

export const ColSpan: Story = {
  render: (args) => {
    return (
      <Grid {...args}>
        <Box className="oui-bg-red-100 oui-text-5xl">1</Box>
        <Grid.span colSpan={2} className="oui-bg-red-200 oui-text-5xl">
          2
        </Grid.span>
        <Box className="oui-bg-red-300 oui-text-5xl">3</Box>
        <Box className="oui-bg-red-400 oui-text-5xl">4</Box>
        <Box className="oui-bg-red-500 oui-text-5xl">5</Box>
      </Grid>
    );
  },
  args: {
    gap: 5,
    // itemAlign: "center",
    // justify: "center",
    className: "oui-min-h-[300px]",
    cols: 3,
  },
};

export const RowSpan: Story = {
  render: (args) => {
    return (
      <Grid {...args}>
        <Box className="oui-bg-red-100 oui-text-5xl">1</Box>
        <Grid.span rowSpan={2} className="oui-bg-red-200 oui-text-5xl">
          2
        </Grid.span>
        <Box className="oui-bg-red-300 oui-text-5xl">3</Box>
        <Box className="oui-bg-red-400 oui-text-5xl">4</Box>
        <Box className="oui-bg-red-500 oui-text-5xl">5</Box>
      </Grid>
    );
  },
  args: {
    gap: 5,
    // itemAlign: "center",
    // justify: "center",
    className: "oui-min-h-[300px]",
    cols: 3,
  },
};
