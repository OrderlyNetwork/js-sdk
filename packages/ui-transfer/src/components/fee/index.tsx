import { FC } from "react";
import { Box, Flex, modal, Text } from "@orderly.network/ui";
import { UseFeeReturn } from "../depositForm/depositForm.script";
import { API } from "@orderly.network/types";

type FeeProps = {
  fee: UseFeeReturn;
  nativeToken?: API.TokenInfo;
};

export const Fee: FC<FeeProps> = (props) => {
  const { dstGasFee, quantity, total } = props.fee;

  const symbol = props.nativeToken?.symbol;

  const onShowFee = () => {
    const message = (
      <div className="oui-text-2xs">
        <Flex gapX={1}>
          <Text intensity={54}>Destination gas fee:</Text>
          <Text intensity={80}>{quantity}</Text>
          <Text intensity={54}>{symbol}</Text>
        </Flex>
        <Box mt={2}>
          <Text intensity={36}>
            Additional gas tokens are required to cover operations on the
            destination chain.
          </Text>
        </Box>
      </div>
    );

    modal.alert({
      title: "Fee",
      message,
    });
  };

  return (
    <Text
      size="xs"
      intensity={36}
      className="oui-border-dashed oui-border-b oui-border-line-12 oui-cursor-pointer"
      onClick={onShowFee}
    >
      {`Fee ≈ `}
      <Text size="xs" intensity={80}>
        {`$${total} `}
      </Text>

      {!!dstGasFee && (
        <Text intensity={54}>
          ({quantity} {symbol})
        </Text>
      )}
    </Text>
  );
};
