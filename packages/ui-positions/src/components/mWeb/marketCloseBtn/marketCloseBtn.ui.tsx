import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { MarketCloseBtnState } from "./marketCloseBtn.script";

export const MarketCloseBtn: FC<MarketCloseBtnState> = (props) => {
  return (
    <Button variant="outlined" color="secondary">
      Market Close
    </Button>
  );
};
