import {
  Box,
  Column,
  DataTable,
  Divider,
  Flex,
  Pagination,
  ScrollArea,
  Text,
} from "@orderly.network/ui";
import { EsOrderlyIcon } from "../components/esOrderlyIcon";
import { OrderlyIcon } from "../components/orderlyIcon";
import { ListType, RewardsHistoryReturns } from "./rewardsHistory.script";
import { FC } from "react";
import { useMediaQuery } from "@orderly.network/hooks";
import { commifyOptional } from "@orderly.network/utils";

export const RewardsHistoryUI: FC<RewardsHistoryReturns> = (props) => {
  return (
    <Flex
      py={4}
      px={3}
      direction={"column"}
      gap={2}
      itemAlign={"start"}
      r="2xl"
      className="oui-bg-base-9 oui-w-full oui-font-semibold oui-tabular-nums"
    >
      <Text className="oui-text-lg oui-px-3">Reward History</Text>
      <div className="oui-border-t-2 oui-border-line-4 oui-w-full">
        <List {...props} />
      </div>
    </Flex>
  );
};

const List: FC<RewardsHistoryReturns> = (props) => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return isMobile ? (
    <ScrollArea className="oui-h-[356px]" orientation="vertical">
      {props.data?.map((item, index) => {
        return <MobileCell data={item} />;
      })}
    </ScrollArea>
  ) : (
    <DesktopList {...props} />
  );
};

const MobileCell: FC<{
  data: ListType;
}> = (props) => {
  const { data } = props;

  return (
    <Flex
      key={data.epoch_id}
      direction={"column"}
      px={4}
      pt={3}
      gap={3}
      className="oui-text-base-contrast-80"
    >
      <Flex direction={"row"} width={"100%"}>
        <Flex
          direction={"column"}
          className="oui-gap-[6px] oui-flex-1"
          itemAlign={"start"}
        >
          <Text className="oui-text-base-contrast-36 oui-text-2xs">Epoch</Text>
          <Text className="oui-text-sm">{`Epoch ${data.epoch_id}`}</Text>
        </Flex>
        <Flex
          direction={"column"}
          className="oui-gap-[6px] oui-flex-1"
          itemAlign={"start"}
        >
          <Text className="oui-text-base-contrast-36 oui-text-2xs">
            Epoch rewards{" "}
          </Text>
          <Text className="oui-text-sm" >
            {commifyOptional(data.max_reward_amount, 2)}
          </Text>
        </Flex>
        <Flex
          direction={"column"}
          className="oui-gap-[6px] oui-flex-1"
          itemAlign={"end"}
        >
          <Text className="oui-text-base-contrast-36 oui-text-2xs">
            Rewards earned{" "}
          </Text>
          <Text className="oui-text-sm">
            {commifyOptional(data.info?.r_wallet)}
          </Text>
        </Flex>
      </Flex>
      <Flex direction={"row"} width={"100%"}>
        <Flex
          direction={"column"}
          className="oui-gap-[6px] oui-flex-1"
          itemAlign={"start"}
        >
          <Text className="oui-text-base-contrast-36 oui-text-2xs">Start</Text>
          <Flex direction={"row"}>
            <Text className="oui-text-sm">
              {formatTimestamp(data.start_time).firstPart}&nbsp;
            </Text>
            <Text className="oui-text-2xs oui-text-base-contrast-36">
              {formatTimestamp(data.start_time).secondPart}
            </Text>
          </Flex>
        </Flex>
        <Flex
          direction={"column"}
          className="oui-gap-[6px] oui-flex-1"
          itemAlign={"end"}
        >
          <Text className="oui-text-base-contrast-36 oui-text-2xs">
            End date
          </Text>
          <Flex direction={"row"}>
            <Text className="oui-text-sm">
              {formatTimestamp(data.end_time).firstPart}&nbsp;
            </Text>
            <Text className="oui-text-2xs oui-text-base-contrast-36">
              {formatTimestamp(data.end_time).secondPart}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Divider />
    </Flex>
  );
};

const DesktopList: FC<RewardsHistoryReturns> = (props) => {
  const { data } = props;
  const columns: Column<ListType>[] = [
    {
      title: "Epoch",
      dataIndex: "epoch_id",
      className: "oui-w-1/4",
      render: (value) => {
        return <Text>{`Epoch ${value}`}</Text>;
      },
    },
    {
      title: "Start / End date",
      dataIndex: "time",
      className: "oui-w-1/4",
      render: (value, record) => {
        return (
          <Flex
            direction={"column"}
            className="oui-gap-[2px]"
            justify={"start"}
            itemAlign={"start"}
          >
            <Flex direction={"row"} gap={1}>
              <Text>{formatTimestamp(record.start_time).firstPart}</Text>
              <Text className="oui-text-base-contrast-54">
                {formatTimestamp(record.start_time).secondPart}
              </Text>
            </Flex>
            <Flex direction={"row"} gap={1}>
              <Text>{formatTimestamp(record.end_time).firstPart}</Text>
              <Text className="oui-text-base-contrast-54">
                {formatTimestamp(record.end_time).secondPart}
              </Text>
            </Flex>
          </Flex>
        );
      },
    },
    {
      title: "Epoch rewards",
      dataIndex: "max_reward_amount",
      className: "oui-w-1/4",
      render: (value, record) => {
        const isOrder =
          `${record?.info?.epoch_token || record.epoch_token}`.toLowerCase() ===
          "order";
        return (
          <Flex direction={"row"} gap={1}>
            {isOrder ? <OrderlyIcon /> : <EsOrderlyIcon />}
            <Text>{commifyOptional(value)}</Text>
          </Flex>
        );
      },
    },
    {
      title: "Rewards earned",
      dataIndex: "earned",
      className: "oui-w-1/4",
      render: (value, record) => {
        const isOrder =
          `${record?.info?.epoch_token || record.epoch_token}`.toLowerCase() ===
          "order";
        return (
          <Flex direction={"row"} gap={1}>
            {isOrder ? <OrderlyIcon /> : <EsOrderlyIcon />}
            <Text>{commifyOptional(record.info?.r_wallet)}</Text>
          </Flex>
        );
      },
    },
  ];

  return (
    <DataTable<ListType>
      columns={columns}
      dataSource={data}
      scroll={{ y: 448 }}
      classNames={{
        header: "oui-text-base-contrast-36 oui-bg-base-9",
        body: "oui-text-base-contrast-80",
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

function formatTimestamp(timestamp?: number) {
  if (typeof timestamp === "undefined")
    return {
      firstPart: "-",
      secondPart: "",
    };
  const date = new Date(timestamp);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate().toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const amPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = (hours % 12).toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  // return `${month} ${day}, ${year}_${formattedHours}:${formattedMinutes} ${amPm}`;
  return {
    firstPart: `${month} ${day}, ${year}`,
    secondPart: `${formattedHours}:${formattedMinutes} ${amPm}`,
  };
}
