import { FC } from "react";
import { Button, Flex, Text, toast } from "@veltodefi/ui";
import { TpSLBtnState } from "./tpSLBtn.script";
import { useTranslation } from "@veltodefi/i18n";

export const TpSLBtn: FC<TpSLBtnState> = (props) => {
  // const { item } = props;
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      color="secondary"
      size="sm"
      className="oui-border-base-contrast-36"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.openTP_SL();
      }}
    >
      {t("common.tpsl")}
    </Button>
  );
};
