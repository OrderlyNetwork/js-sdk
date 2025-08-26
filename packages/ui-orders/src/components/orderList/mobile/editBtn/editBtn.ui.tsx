import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button } from "@orderly.network/ui";
import { EditBtnState } from "./editBtn.script";

export const EditBtn: FC<EditBtnState> = (props) => {
  const { t } = useTranslation();

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
