import { FC } from "react";
import { Button, Flex, SimpleDialog, Text } from "@orderly.network/ui";
import { CancelBtnState } from "./cancelBtn.script";

export const CancelBtn: FC<CancelBtnState> = (props) => {
  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        color="secondary"
        size="sm"
        className="oui-border-base-contrast-36"
        onClick={(e) => props.setOpen(true)}
      >
        Cancel
      </Button>
      {props.open && (
        <SimpleDialog
          size="xs"
          open={props.open}
          onOpenChange={props.setOpen}
          title="Cancel order"
          actions={{
            primary: {
              label: "Confirm",
              loading: props.isLoading,
              fullWidth: true,
              size: "md",
              onClick: (e) => {
                props.onCancel(e);
              },
            },
            secondary: {
              label: "Cancel",
              fullWidth: true,
              size: "md",
              onClick: () => {
                props.onClose();
              },
            },
          }}
        >
          <Text size="2xs" intensity={54}>
            Are you sure you want to cancel your pending order.
          </Text>
        </SimpleDialog>
      )}
    </>
  );
};
