import { FC } from "react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Input,
  inputFormatter,
  SimpleDialog,
  SimpleSheet,
  Slider,
  Text,
} from "@orderly.network/ui";
import { EditBtnState } from "./editBtn.script";
import { Decimal } from "@orderly.network/utils";

export const EditBtn: FC<EditBtnState> = (props) => {
  const { item, } = props;
  const isBuy = item.quantity > 0;
  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        color="secondary"
        size="sm"
        onClick={() => {
          props.onShowEditSheet();
        }}
      >
        Edit
      </Button>
    </>
  );
};
