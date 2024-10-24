import type { StoryObj } from "@storybook/react";
import { Box, Text, TableView, Input, DataFilter } from "@orderly.network/ui";
import { Columns } from "./columns";
import { DataSource } from "./dataSource";
import { useEffect, useState } from "react";

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
    const [pagination, setPagination] = useState({
      pageIndex: 1,
      pageSize: 20,
    });

    const [loading, setLoading] = useState(true);

    const [columnFilters, setColumnFilters] = useState({
      id: "symbol",
      value: "btc",
    });
    const [type, setType] = useState<string>("All");

    useEffect(() => {
      setTimeout(() => {
        setDataSource(DataSource);
        setLoading(false);
      }, 2000);
    }, []);

    return (
      <Box width={600} height={600} p={3} intensity={900}>
        <Input
          value={columnFilters.value}
          onValueChange={(value) => {
            setColumnFilters({
              ...columnFilters,
              value,
            });
          }}
          placeholder="Search"
          classNames={{ root: "oui-border oui-mt-[1px] oui-border-line" }}
          size="sm"
          autoComplete="off"
        />
        <DataFilter
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
        />
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
          border={{ header: { top: true, bottom: true }, body: true }}
          pagination={pagination}
          onPaginationChange={setPagination}
          loading={loading}
          classNames={
            {
              // header: "oui-text-base oui-text-base-contrast-80",
              // body: "oui-text-base oui-text-base-contrast-36",
            }
          }
          columnFilters={columnFilters}
        />
      </Box>
    );
  },
};
