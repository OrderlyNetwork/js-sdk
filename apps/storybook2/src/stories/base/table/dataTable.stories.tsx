import type { Meta, StoryObj } from "@storybook/react";
// import {fn} from '@storybook/test';
import { Card, DataTable, Filter, Pagination } from "@orderly.network/ui";
import { OverviewModule } from "@orderly.network/portfolio";
import { OrderlyApp } from "@orderly.network/react-app";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { transSymbolformString } from "@orderly.network/utils";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Base/Table/DataTable",
  component: DataTable,
  parameters: {
    // layout: 'centered',
  },
  decorators: [
    (Story) => (
      <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
        <Card>
          <Story />
        </Card>
      </OrderlyApp>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  args: {
    bordered: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    columns: [{ title: "Symbol", dataIndex: "symbol" }],
    dataSource: [
      {
        symbol: "ETH",
      },
    ],
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
