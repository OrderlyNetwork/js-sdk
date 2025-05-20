import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  DataTable,
  Input,
  Flex,
  cn,
  usePagination,
  Badge,
} from "@orderly.network/ui";
import { Columns } from "./columns";
import { DataSource } from "./dataSource";

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
      pageSize: 20,
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
          expanded={{
            main_account: true,
            sub_account: true,
            // PERP_TIA_USDC: true,
          }}
          // getRowCanExpand={() => true}
          // expandRowRender={(row) => {
          //   return (
          //     <div>
          //       <Badge>Top</Badge>
          //     </div>
          //   );
          //   return (
          //     <pre style={{ fontSize: "10px" }} className="oui-bg-base-8">
          //       <code>{JSON.stringify(row.original, null, 2)}</code>
          //     </pre>
          //   );
          // }}
          getSubRows={(row) => row.children}
          bordered
          pagination={pagination}
          loading={loading}
          onCell={(column, record, index) => {
            const isGroup = record.children?.length > 0;
            if (isGroup) {
              return {
                children:
                  column.id === "symbol" ? (
                    <Badge color="neutral" size="xs">
                      {record.title}
                    </Badge>
                  ) : null,
              };
            }
          }}
          classNames={{
            root: cn(
              "!oui-h-[calc(100%_-_40px)]",
              "oui-border-t oui-border-line",
            ),
            // header: "oui-text-base oui-text-base-contrast-80",
            // body: "oui-text-base oui-text-base-contrast-36",
          }}
          // onRow={(record) => {
          //   return {
          //
          // className: "oui-h-6",
          //   };
          // }}
          columnFilters={columnFilters}
          generatedRowKey={(record) => record.symbol}
          // rowSelection={{ PERP_BTC_USDC: true }}
        />
      </Box>
    );
  },
};
