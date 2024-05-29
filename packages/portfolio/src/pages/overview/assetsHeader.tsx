import {
  ArrowDownSquareFillIcon,
  ArrowUpSquareFillIcon,
  Button,
  CardTitle,
  Flex,
  Text,
} from "@orderly.network/ui";

export const AssetsHeader = () => {
  return (
    <Flex justify={"between"}>
      <CardTitle>My Assets</CardTitle>
      <Flex gap={3}>
        <Button size="md" color="secondary" icon={<ArrowUpSquareFillIcon />}>
          Withdraw
        </Button>
        <Button size="md" icon={<ArrowDownSquareFillIcon />}>
          Deposit
        </Button>
      </Flex>
    </Flex>
  );
};
