import type { StoryObj } from "@storybook/react";
import {
  Box,
  Text,
  TableView,
  Input,
  DataFilter,
  Flex,
  cn,
  usePagination,
  PaginationMeta,
} from "@orderly.network/ui";
import { Columns } from "./columns";
import { DataSource } from "./dataSource";
import { useEffect, useMemo, useState } from "react";

const meta = {
  title: "Base/Table/TableView",
  component: TableView,
  decorators: [(Story: any) => <Story />],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [dataSource, setDataSource] = useState([] as any);
    const { page, pageSize, setPage, setPageSize } = usePagination({
      pageSize: 50,
    });

    const [loading, setLoading] = useState(true);

    const [columnFilters, setColumnFilters] = useState({
      id: "symbol",
      value: "",
    });
    const [type, setType] = useState<string>("All");

    useEffect(() => {
      setTimeout(() => {
        setDataSource(DataSource);
        setLoading(false);
      }, 2000);
    }, []);

    const pagination = useMemo(() => {
      return {
        page,
        pageSize,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      } as PaginationMeta;
    }, [page, pageSize, setPage, setPageSize]);

    useEffect(() => {
      setPage(1);
    }, [pageSize]);

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
          {/* <DataFilter
            items={[
              {
                type: "select",
                name: "type",
                options: [
                  { label: "All", value: "All" },
                  { label: "Referral commission", value: "REFERRER_REBATE" },
                  { label: "Referee rebate", value: "REFEREE_REBATE" },
                  { label: "Broker fee", value: "BROKER_FEE" },
                ],
                value: type,
              },
            ]}
            onFilter={(value) => {
              // onFilter(value);
            }}
          /> */}
        </Flex>
        <TableView
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
