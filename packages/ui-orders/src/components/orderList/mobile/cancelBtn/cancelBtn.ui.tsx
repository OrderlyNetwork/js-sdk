import { FC } from "react";
import { Button, SimpleDialog, Text } from "@orderly.network/ui";
import { CancelBtnState } from "./cancelBtn.script";
import { useTranslation } from "@orderly.network/i18n";

export const CancelBtn: FC<CancelBtnState> = (props) => {
  const { t } = useTranslation();

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
        {t("common.cancel")}
      </Button>
      {props.open && (
        <SimpleDialog
          size="xs"
          open={props.open}
          onOpenChange={props.setOpen}
          title={t("orders.cancelOrder")}
          actions={{
            primary: {
              label: t("common.confirm"),
              loading: props.isLoading,
              fullWidth: true,
              size: "md",
              onClick: (e) => {
                props.onCancel(e);
              },
            },
            secondary: {
              label: t("common.cancel"),
              fullWidth: true,
              size: "md",
              onClick: () => {
                props.onClose();
              },
            },
          }}
        >
          <Text size="2xs" intensity={54}>
            {t("orders.cancelOrder.description")}
          </Text>
        </SimpleDialog>
      )}
    </>
  );
};
