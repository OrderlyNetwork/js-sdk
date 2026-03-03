import { FC, useMemo, ReactNode } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box } from "@orderly.network/ui";

type NoticeProps = {
  message?: ReactNode;
  wrongNetwork?: boolean;
};

export const Notice: FC<NoticeProps> = (props) => {
  const { message, wrongNetwork } = props;
  const { t } = useTranslation();

  const content = useMemo(() => {
    if (wrongNetwork) {
      return t("connector.wrongNetwork.tooltip");
    }

    return message;
  }, [message, wrongNetwork, t]);

  if (content) {
    return (
      <Box
        mb={3}
        className="oui-text-center oui-text-xs oui-text-warning-darken"
      >
        {content}
      </Box>
    );
  }

  return null;
};
