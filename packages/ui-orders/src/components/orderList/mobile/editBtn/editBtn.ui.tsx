import { FC } from "react";
import { Button } from "@orderly.network/ui";
import { EditBtnState } from "./editBtn.script";

export const EditBtn: FC<EditBtnState> = (props) => {
  const { item } = props;
  const isBuy = item.quantity > 0;
  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        color="secondary"
        size="sm"
        className="oui-border-base-contrast-36"
        onClick={() => {
          props.onShowEditSheet();
        }}
      >
        Edit
      </Button>
    </>
  );
};
