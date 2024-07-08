import { Button, Divider, Flex, Input } from "@orderly.network/ui";

export const TPSL = () => {
  return (
    <div>
      <Flex gap={2}>
        <Input />
        <Button>Submit</Button>
      </Flex>
      <Divider />
    </div>
  );
};
