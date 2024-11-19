import type { Meta, StoryObj } from "@storybook/react";
import { AuthGuard, AuthGuardDataTable } from "@orderly.network/ui-connector";
import { AccountStatusEnum } from "@orderly.network/types";
import { Text, Flex } from "@orderly.network/ui";
import { OverviewModule } from "@orderly.network/portfolio";

const meta: Meta<typeof AuthGuard> = {
  title: "Package/ui-connector/AuthGuard",
  component: AuthGuard,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: AccountStatusEnum.EnableTrading,
    children: <Text>Trading view</Text>,
  },
};

export const OnlyMainnet: Story = {
  args: {
    status: AccountStatusEnum.EnableTrading,
    children: <Text>Trading view</Text>,
    networkId: "mainnet",
  },
};

export const OnlyBridgeLess: Story = {
  args: {
    status: AccountStatusEnum.EnableTrading,
    children: <Text>Trading view</Text>,
    bridgeLessOnly: true,
  },
};

export const DataTable: Story = {
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
      <AuthGuardDataTable
        {...args}
        columns={args.columns}
        dataSource={dataSource}
        loading={isLoading}
      />
    );
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
        render: (value: any, record) => {
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
