import { FC } from "react";
import { Column, DataTable, DatePicker, Flex, Text } from "@orderly.network/ui";
import { RebatesReturns } from "./rebates.script";

export const RebatesUI: FC<RebatesReturns> = (props) => {
  return (
    <Flex
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9"
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
      <Text className="oui-text-lg">TitleStatistic</Text>
      <Text intensity={36} className="oui-text-2xs">
        2024-03-02 00:00 UTC
      </Text>
    </Flex>
  );
};

const List: FC<RebatesReturns> = (props) => {
  const columns: Column[] = [
    {
      title: "Rebates (USDC)",
      dataIndex: "rebates",
      render: (value) => "$0.048",
      width: 127,
    },
    {
      title: "Trading vol. (USDC)",
      dataIndex: "trading-vol",
      render: (value) => "232.22",
      width: 127,
    },
    {
      title: "Date",
      dataIndex: "trading-vol",
      render: (value) => "2023-11-27",
      width: 127,
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      scroll={{ y: 240 }}
      classNames={{
        header: "oui-text-xs oui-text-base-contrast-36",
        body: "oui-text-xs oui-text-base-contrast-80",
      }}
    ></DataTable>
  );
};
