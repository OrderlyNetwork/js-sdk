import { FC } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { Button } from "@veltodefi/ui";
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
