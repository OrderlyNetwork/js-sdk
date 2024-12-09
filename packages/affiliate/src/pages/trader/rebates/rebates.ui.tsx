import { FC } from "react";
import {
  DatePicker,
  Divider,
  Flex,
  ListView,
  Statistic,
  Column,
  Text,
} from "@orderly.network/ui";
import { RebatesItem, RebatesReturns } from "./rebates.script";
import { commifyOptional } from "@orderly.network/utils";
import { useMediaQuery } from "@orderly.network/hooks";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";

export const Rebates: FC<RebatesReturns> = (props) => {
  return (
    <Flex
      id="oui-affiliate-trader-rebates"
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9 oui-tabular-nums"
    >
      <Title {...props} />
      <Flex
        width={"100%"}
        className="oui-border-y-2 oui-border-line-6"
        height={49}
        direction={"row"}
        itemAlign={"center"}
      >
        <div>
          <DatePicker.range
            size="xs"
            value={props.dateRange}
            onChange={(range) => {
              props.setDateRange(range);
            }}
            max={90}
            disabled={{
              after: new Date(),
            }}
          />
        </div>
      </Flex>
      <List {...props} />
    </Flex>
  );
};

const Title: FC<RebatesReturns> = (props) => {
  return (
    <Flex direction={"row"} justify={"between"} width={"100%"}>
      <Text className="oui-text-lg">My rebates</Text>
      <Text intensity={36} className="oui-text-2xs">
        {props.displayDate}
      </Text>
    </Flex>
  );
};

const List: FC<RebatesReturns> = (props) => {
  const layout767 = useMediaQuery("(max-width: 767px)");

  const columns: Column<RebatesItem>[] = [
    {
      title: "Rebates (USDC)",
      dataIndex: "referee_rebate",
      render: (value) => (
        <Text>
          {commifyOptional(value, {
            fix: 6,
            fallback: "0",
            padEnd: true,
            prefix: "$",
          })}
        </Text>
      ),
      width: 127,
    },
    {
      title: "Trading vol. (USDC)",
      dataIndex: "vol",
      render: (value) =>
        commifyOptional(value, {
          fix: 2,
          fallback: "0",
          padEnd: true,
          prefix: "$",
        }),
      width: 127,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (value) => (
        <Text.formatted formatString="yyyy-MM-dd">{value}</Text.formatted>
      ),
      width: 127,
    },
  ];

  if (layout767) {
    return (
      <ListView<RebatesItem, RebatesItem[]>
        dataSource={props.dataSource}
        className="oui-h-[197px] oui-w-full"
        renderItem={(item, index) => {
          return <Cell item={item} />;
        }}
      />
    );
  }

  return (
    <AuthGuardDataTable
      bordered
      loading={props.isLoading}
      columns={columns}
      dataSource={props.dataSource}
      ignoreLoadingCheck={true}
      onRow={(record) => {
        return {
          className: "oui-h-[41px]",
        };
      }}
      pagination={props.pagination}
      manualPagination={false}
    />
  );
};

const Cell = (props: { item: RebatesItem }) => {
  return (
    <Flex direction={"column"} width={"100%"}>
      <Flex width={"100%"} gap={1}>
        <Statistic
          label="Rebates (USDC)"
          className="oui-text-xs oui-text-base-contrast-54 oui-flex-1 oui-min-w-[105px]"
        >
          <Text size="sm" intensity={80}>
            {commifyOptional(props.item.referee_rebate, {
              fix: 6,
              fallback: "0",
              padEnd: true,
              prefix: "$",
            })}
          </Text>
        </Statistic>
        <Statistic
          label="Trading vol. (USDC)  "
          className="oui-text-xs oui-text-base-contrast-54 oui-flex-shrink"
        >
          <Text size="sm" intensity={80}>
            {commifyOptional(props.item.vol, {
              fix: 2,
              fallback: "0",
              padEnd: true,
              prefix: "$",
            })}
          </Text>
        </Statistic>
        <Statistic
          label="Date"
          className="oui-text-xs oui-text-base-contrast-54 oui-flex-1"
          align="end"
        >
          <Text.formatted size="sm" intensity={80} formatString="yyyy-MM-dd">
            {props.item.date}
          </Text.formatted>
        </Statistic>
      </Flex>
      <Divider className="oui-w-full oui-mt-3" />
    </Flex>
  );
};
