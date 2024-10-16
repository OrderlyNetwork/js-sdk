import { FC } from "react";
import { Button, Flex, Text, toast } from "@orderly.network/ui";
import { TpSLBtnState } from "./tpSLBtn.script";

export const TpSLBtn: FC<TpSLBtnState> = (props) => {
  // const { item } = props;
  //
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.openTP_SL();
      }}
    >
      TP/SL
    </Button>
  );
};
