import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  DataTable,
  Input,
  Flex,
  cn,
  usePagination,
} from "@orderly.network/ui";
import { Columns } from "./columns";
import { DataSource } from "./dataSource";
import { useEffect, useState } from "react";

const meta: Meta<typeof DataTable> = {
  title: "Base/Table/Table",
  component: DataTable,
  decorators: [(Story: any) => <Story />],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [dataSource, setDataSource] = useState([] as any);
    const { pagination } = usePagination({
      pageSize: 50,
    });

    const [loading, setLoading] = useState(true);

    const [columnFilters, setColumnFilters] = useState({
      id: "symbol",
      value: "",
    });

    useEffect(() => {
      setTimeout(() => {
        setDataSource(DataSource);
        setLoading(false);
      }, 2000);
    }, []);

    return (
      <Box width={800} height={600} p={3} intensity={900}>
        <Flex gapX={1} mb={3}>
          <Input
            value={columnFilters.value}
            onValueChange={(value) => {
              setColumnFilters({
                ...columnFilters,
                value,
              });
            }}
            placeholder="Search"
            classNames={{ root: "oui-w-[200px] oui-border oui-border-line" }}
            size="sm"
            autoComplete="off"
          />
        </Flex>
        <DataTable
          columns={Columns}
          dataSource={dataSource}
          // getRowCanExpand={() => true}
          // renderRowExpand={(row) => {
          //   return (
          //     <pre style={{ fontSize: "10px" }} className="oui-bg-base-8">
          //       <code>{JSON.stringify(row.original, null, 2)}</code>
          //     </pre>
          //   );
          // }}
          bordered
          pagination={pagination}
          loading={loading}
          classNames={{
            root: cn(
              "!oui-h-[calc(100%_-_40px)]",
              "oui-border-t oui-border-line"
            ),
            // header: "oui-text-base oui-text-base-contrast-80",
            // body: "oui-text-base oui-text-base-contrast-36",
          }}
          // onRow={(record) => {
          //   return {
          //     className: "oui-h-6",
          //   };
          // }}
          columnFilters={columnFilters}
          generatedRowKey={(record) => record.symbol}
          rowSelection={{ PERP_BTC_USDC: true }}
        />
      </Box>
    );
  },
};
