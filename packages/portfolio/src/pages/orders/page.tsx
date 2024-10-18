import { Divider, Flex, Text } from "@orderly.network/ui";
import { OrdersWidget } from "@orderly.network/ui-orders";

export const OrdersPage = () => {
  return (
    <Flex p={6} direction={"column"} itemAlign={"start"} gap={4}>
      <Flex>
        <Text size="lg">Orders</Text>
      </Flex>
      <Divider className="oui-w-full" />
      <OrdersWidget />
    </Flex>
  );
};
