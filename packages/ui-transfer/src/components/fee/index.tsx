import { FC } from "react";
import { Text } from "@orderly.network/ui";

type FeeProps = {};

export const Fee: FC<FeeProps> = (props) => {
  return (
    <Text size="xs" intensity={36}>
      {`Fee ≈ `}
      <Text size="xs" intensity={80}>
        {`0 `}
      </Text>
      USDC
    </Text>
  );
};
