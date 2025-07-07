import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum, NetworkId } from "@orderly.network/types";
import { Box, Button } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";

export interface ConvertActionButtonProps {
  disabled?: boolean;
  loading?: boolean;
  symbol?: string;
  networkId?: NetworkId;
  onConvert?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ConvertAction: React.FC<ConvertActionButtonProps> = (props) => {
  const { disabled, loading, networkId, onConvert } = props;
  const { t } = useTranslation();
  return (
    <Box className="oui-w-full lg:oui-w-auto lg:oui-min-w-[184px]">
      <AuthGuard
        status={AccountStatusEnum.EnableTrading}
        networkId={networkId}
        buttonProps={{ fullWidth: true, size: { initial: "md", lg: "lg" } }}
      >
        <Button
          fullWidth
          disabled={disabled}
          loading={loading}
          size={{ initial: "md", lg: "lg" }}
          onClick={onConvert}
        >
          {t("transfer.convert")}
        </Button>
      </AuthGuard>
    </Box>
  );
};
