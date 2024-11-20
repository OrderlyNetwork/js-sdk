import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
  Box,
} from "@orderly.network/ui";
import { markets } from "../../../constants/mockdata";

const meta: Meta<typeof Table> = {
  title: "Base/Table/HtmlTable",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    bordered: { control: "boolean" },
  },
  args: { bordered: true },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Box className="oui-bg-white" width={"500px"}>
        <Table>
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow bordered={args.bordered}>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow key={market.id} bordered={args.bordered}>
                <TableCell className="font-medium">{market.symbol}</TableCell>
                <TableCell>{market.last}</TableCell>
                <TableCell>{market.update}</TableCell>
                <TableCell className="text-right">{market.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">$2,500.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Box>
    );
  },
};
