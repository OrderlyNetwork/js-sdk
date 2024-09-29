import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { TpSLBtnState } from "./tpSLBtn.script";


export const TpSLBtn: FC<TpSLBtnState> = (props) => {

    // const { item } = props;
    return (
      <Button variant="outlined" color="secondary">
        TP/SL
      </Button>
    );
}
