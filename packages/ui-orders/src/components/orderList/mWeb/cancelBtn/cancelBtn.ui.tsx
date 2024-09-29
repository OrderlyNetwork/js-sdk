import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { CancelBtnState } from "./cancelBtn.script";

export const CancelBtn: FC<CancelBtnState> = (props) => {
  return (
    <Button variant="outlined" fullWidth color="secondary" size="sm">
      Cancel
    </Button>
  );
};
