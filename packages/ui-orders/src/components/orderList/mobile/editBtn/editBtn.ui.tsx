import { FC } from "react";
import { Button } from "@orderly.network/ui";
import { EditBtnState } from "./editBtn.script";
import { useTranslation } from "@orderly.network/i18n";

export const EditBtn: FC<EditBtnState> = (props) => {
  const { t } = useTranslation();
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
        {t("common.edit")}
      </Button>
    </>
  );
};
