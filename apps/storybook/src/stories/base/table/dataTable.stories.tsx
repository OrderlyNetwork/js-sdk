import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  Card,
  DataTable,
  Filter,
  Flex,
  Pagination,
  Text,
} from "@orderly.network/ui";
import { OverviewModule } from "@orderly.network/portfolio";
import { useSymbolsInfo } from "@orderly.network/hooks";

const meta = {
  title: "Base/Table/DataTable",
  component: DataTable,
  parameters: {
    // layout: 'centered',
  },
  decorators: [
    (Story: any) => (
      <Card>
        <Story />
      </Card>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  args: {
    bordered: true,
    columns: [
      {
        title: "Instrument",
        dataIndex: "symbol",
        width: 80,
        rule: "symbol",
        textProps: {
          showIcon: true,
        },
      },
      {
        title: "Time",
        dataIndex: "created_time",
        width: 120,
        rule: "date",
        onSort: true,
      },
      {
        title: "Funding rate / Annual rate",
        dataIndex: "funding_rate",
        width: 80,
        render: (value: any, record: any) => {
          return (
            <Flex gap={1}>
              <Text.numeral rule={"percentages"}>
                {record.funding_rate}
              </Text.numeral>
              <span>/</span>
              <Text.numeral rule={"percentages"}>
                {record.annual_rate}
              </Text.numeral>
            </Flex>
          );
        },
      },
      {
        title: "Payment type",
        dataIndex: "payment_type",
        width: 80,
        render: (value: any) => {
          switch (value) {
            case "Pay":
              return "Paid";
            case "Receive":
              return "Received";
            default:
              return value;
          }
        },
      },
      {
        title: "Funding fee (USDC)",
        dataIndex: "funding_fee",
        width: 80,
        rule: "price",
        onSort: true,
        align: "right",
        numeralProps: {
          coloring: true,
          showIdentifier: true,
        },
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: [
      {
        title: "Symbol",
        dataIndex: "symbol",
        render: (value) => <div>{value}</div>,
      },
    ],
    dataSource: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
      () => ({
        symbol: "ETH",
      })
    ),
  },
};

export const DataFilter: Story = {
  render: (args) => {
    const columns = OverviewModule.useFundingHistoryColumns();
    const symbols = useSymbolsInfo();

    const {
      dataSource,
      queryParameter,
      onFilter,
      isLoading,
      meta,
      setPage,
      setPageSize,
    } = OverviewModule.useFundingHistoryHook();

    const { dateRange, symbol } = queryParameter;

    return (
      <DataTable
        {...args}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        scroll={{ y: 300 }}
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80",
        }}
      >
        <Filter
          items={[
            {
              type: "select",
              name: "symbol",
              options: [
                {
                  label: "All",
                  value: "All",
                },
                ...Object.keys(symbols).map((symbol) => {
                  // const s = transSymbolformString(symbol);
                  return {
                    label: symbol,
                    value: symbol,
                  };
                }),
              ],
              value: symbol,
            },
            {
              type: "range",
              name: "dateRange",
              value: {
                from: dateRange[0],
                to: dateRange[1],
              },
            },
          ]}
          onFilter={(value) => {
            onFilter(value);
          }}
        />
        <Pagination
          {...meta}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </DataTable>
    );
  },
};

export const Sortable: Story = {
  render: (args) => {
    const {
      dataSource,
      queryParameter,
      onFilter,
      isLoading,
      meta,
      setPage,
      setPageSize,
    } = OverviewModule.useFundingHistoryHook();

    return (
      <DataTable
        {...args}
        columns={args.columns}
        dataSource={dataSource}
        loading={isLoading}
      />
    );
  },
};
export const SortableByBackend: Story = {
  render: (args) => {
    const {
      dataSource,
      queryParameter,
      onFilter,
      isLoading,
      meta,
      setPage,
      setPageSize,
    } = OverviewModule.useFundingHistoryHook();

    return (
      <DataTable
        {...args}
        columns={args.columns}
        dataSource={dataSource}
        loading={isLoading}
      />
    );
  },
  args: {
    onSort: fn(),
    initialSort: {
      sortKey: "created_time",
      sort: "asc",
    },
  },
};

export const ScrollView: Story = {
  render: (args) => {
    const {
      dataSource,
      queryParameter,
      onFilter,
      isLoading,
      meta,
      setPage,
      setPageSize,
    } = OverviewModule.useFundingHistoryHook();

    return (
      <DataTable
        {...args}
        columns={args.columns}
        dataSource={dataSource}
        loading={isLoading}
      />
    );
  },
  args: {
    scroll: { y: 200 },
  },
};

// export const FixedColumns: Story = {
//   decorators: [
//     (Story) => (
//       <Box width={"500px"}>
//         <Story />
//       </Box>
//     ),
//   ],
// };
