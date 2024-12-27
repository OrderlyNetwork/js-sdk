import { Box, Divider, Flex, Text } from "@orderly.network/ui";
import { OrdersWidget } from "@orderly.network/ui-orders";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";
export const OrdersPage = (
  props: {
    sharePnLConfig?: SharePnLConfig &
      Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
  }
) => {
  console.log("sharePnLConfig", props.sharePnLConfig);
  const { sharePnLConfig } = props;
  return (
    <Flex
      // p={6}
      direction={"column"}
      itemAlign={"start"}
      gap={4}
      width="100%"
      height="100%"
    >
      <Flex>
        <Text size="lg">Orders</Text>
      </Flex>
      <Divider className="oui-w-full" />
      {/* 26(title height) + 1(divider) + 32 (padding) */}
      <Box width="100%" className="oui-h-[calc(100%_-_59px)]">
        <OrdersWidget sharePnLConfig={sharePnLConfig} />
      </Box>
    </Flex>
  );
};
