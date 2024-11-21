import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import {
  Flex,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  Text,
} from "@orderly.network/ui";

const { numeral: Numeral } = Text;

const meta = {
  title: "Base/Typography/Numeral",
  component: Numeral,
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
      options: [
        "3xs",
        "2xs",
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
      ],
    },
    color: {
      control: {
        type: "inline-radio",
      },
      options: [
        "primary",
        "secondary",
        "tertiary",
        "warning",
        "danger",
        "success",
        "buy",
        "sell",
        "neutral",
        "profit",
        "lose",
      ],
    },
  },
  args: {
    size: "base",
    weight: "regular",
    color: "primary",
    coloring: true,
    rule: "price",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 2323.023,
    rule: "price",
    dp: 4,
    copyable: false,
  },
};

export const Percentages: Story = {
  args: {
    children: 0.233423,
    dp: 4,
    rule: "percentages",
  },
};

export const RemovePadding: Story = {
  args: {
    children: 450.0,
    dp: 0,
    padding: false,
  },
};

export const RoundingMode: Story = {
  render: (args) => {
    return (
      <div>
        <Text>Origin value: 2343542.23347323</Text>
        <Table className="oui-w-[400px] oui-border">
          <TableHeader>
            <TableRow>
              <TableHead>Mode</TableHead>
              <TableHead>Value</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>truncate</TableCell>
              <TableCell>truncate</TableCell>
              <TableCell>
                <Numeral {...args} dp={4} rm={"truncate"} />
              </TableCell>
            </TableRow>
            {[
              "ROUND_UP",
              "ROUND_DOWN",
              "ROUND_CEIL",
              "ROUND_FLOOR",
              "ROUND_HALF_UP",
              "ROUND_HALF_DOWN",
              "ROUND_HALF_EVEN",
              "ROUND_HALF_CEIL",
              "ROUND_HALF_FLOOR",
            ].map((mode, index) => {
              return (
                <TableRow>
                  <TableCell>{mode}</TableCell>
                  <TableCell>{index}</TableCell>
                  <TableCell>
                    <Numeral {...args} dp={4} rm={index} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  },
  args: {
    children: 2343542.23347323,
  },
};
