import { Box, Column, DataTable, Divider, Flex, ScrollArea, Text } from "@orderly.network/ui";
import { EsOrderlyIcon } from "../components/esOrderlyIcon";
import { OrderlyIcon } from "../components/orderlyIcon";

export const RewardsHistoryUI = () => {
  return (
    <Flex
      py={4}
      px={3}
      direction={"column"}
      gap={2}
      itemAlign={"start"}
      r="2xl"
      className="oui-bg-base-9 oui-w-full oui-font-semibold"
    >
      <Text className="oui-text-lg oui-px-3">Reward History</Text>
      <div className="oui-border-t-2 oui-border-line-4 oui-w-full">
        <List />
      </div>
    </Flex>
  );
};

const List = () => {
  return <MobileList />;
};

const MobileList = () => {
  return (
    <ScrollArea className="oui-h-[356px]" orientation="vertical">
        <MobileCell/>
        <MobileCell/>
        <MobileCell/>
        <MobileCell/>
        <MobileCell/>
    </ScrollArea>
  );
};

const MobileCell = () => {

    return (
        <Flex direction={"column"} px={4} pt={3} gap={3}>
          <Flex direction={"row"} width={"100%"}>
            <Flex
              direction={"column"}
              className="oui-gap-[6px] oui-flex-1"
              itemAlign={"start"}
            >
              <Text className="oui-text-base-contrast-36 oui-text-2xs">Epoch</Text>
              <Text className="oui-text-sm">Epoch</Text>
            </Flex>
            <Flex
              direction={"column"}
              className="oui-gap-[6px] oui-flex-1"
              itemAlign={"start"}
            >
              <Text className="oui-text-base-contrast-36 oui-text-2xs">
                Epoch rewards{" "}
              </Text>
              <Text className="oui-text-sm">Epoch</Text>
            </Flex>
            <Flex
              direction={"column"}
              className="oui-gap-[6px] oui-flex-1"
              itemAlign={"end"}
            >
              <Text className="oui-text-base-contrast-36 oui-text-2xs">
                Rewards earned{" "}
              </Text>
              <Text className="oui-text-sm">Epoch</Text>
            </Flex>
          </Flex>
          <Flex direction={"row"} width={"100%"}>
            <Flex
              direction={"column"}
              className="oui-gap-[6px] oui-flex-1"
              itemAlign={"start"}
            >
              <Text className="oui-text-base-contrast-36 oui-text-2xs">Start</Text>
              <Text className="oui-text-sm">Epoch</Text>
            </Flex>
            <Flex
              direction={"column"}
              className="oui-gap-[6px] oui-flex-1"
              itemAlign={"end"}
            >
              <Text className="oui-text-base-contrast-36 oui-text-2xs">
                End date
              </Text>
              <Text className="oui-text-sm">Epoch</Text>
            </Flex>
          </Flex>
          <Divider />
        </Flex>
      );
};

const DesktopList = () => {

    let coluns: Column[] = [
        {
            title: "Epoch",
            dataIndex: "epoch_id",
            render: (value) => {
                return <Text className="oui-text-base-contrast-36">{`Epoch ${value}`}</Text>
            }
        },
        {
            title: "Start / End date",
            dataIndex: "time",
            render: (value, record) => {
                return (
                    <Flex direction={"column"} className="oui-gap-[2px]">
                        <Flex direction={"row"}>
                            <Text></Text>
                            <Text className="oui-text-base-contrast-54">00:00AM</Text>
                        </Flex>
                        <Flex direction={"row"}>
                            <Text></Text>
                            <Text className="oui-text-base-contrast-54">00:00AM</Text>
                        </Flex>
                    </Flex>
                );
            }
        },
        {
            title: "Epoch rewards",
            dataIndex: "",
            render: (value) => {
                const isEsorder = false;
                return (
                    <Flex>
                        {isEsorder ? <EsOrderlyIcon /> : <OrderlyIcon />}
                        {value}
                    </Flex>
                );
            }
        },
        {
            title: "Rewards earned",
            dataIndex: "",
            render: (value) => {
                const isEsorder = false;
                return (
                    <Flex>
                        {isEsorder ? <EsOrderlyIcon /> : <OrderlyIcon />}
                        {value}
                    </Flex>
                );
            }
        },

    ];


    return (
        <DataTable columns={[]} />
    );
};
