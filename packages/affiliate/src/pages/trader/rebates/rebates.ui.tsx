import { FC } from "react";
import {
  Column,
  DataTable,
  DatePicker,
  Flex,
  Pagination,
  Text,
} from "@orderly.network/ui";
import { RebatesItem, RebatesReturns } from "./rebates.script";
import { commifyOptional } from "@orderly.network/utils";
import { subDays } from "date-fns";

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
            max={89}
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
          fix: 6,
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

  return (
    <DataTable
      bordered
      columns={columns}
      dataSource={props.dataSource}
      scroll={{ y: 240 }}
      classNames={{
        header: "oui-text-xs oui-text-base-contrast-36 oui-bg-base-9",
        body: "oui-text-xs oui-text-base-contrast-80",
      }}
    >
      <Pagination
        {...props.meta}
        onPageChange={props.onPageChange}
        onPageSizeChange={props.onPageSizeChange}
      />
    </DataTable>
  );
};
