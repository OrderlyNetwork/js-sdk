import { Divider, Flex, Text } from "@orderly.network/ui";

type ConfirmContentProps = {
  symbol: string;
  qty: number;
  tpPrice?: number;
  slPrice?: number;
  price: number | string;
};

export const ConfirmContent = (props: ConfirmContentProps) => {
  return (
    <div>
      <Flex></Flex>
      <Divider />

      <Flex justify={"between"}>
        <Text intensity={54} size="xs" weight="semibold">
          Subtotal
        </Text>
        <Text>101.0493</Text>
      </Flex>
    </div>
  );
};
