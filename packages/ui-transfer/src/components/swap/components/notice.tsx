import { FC, useMemo, ReactNode } from "react";
import { useTranslation, Trans } from "@veltodefi/i18n";
import { NetworkId } from "@veltodefi/types";
import { Box, Text } from "@veltodefi/ui";
import { modal } from "@veltodefi/ui";
import { ChainSelectorDialogId } from "@veltodefi/ui-chain-selector";

type NoticeProps = {
  message?: string | ReactNode;
  needSwap?: boolean;
  needCrossSwap?: boolean;
  wrongNetwork?: boolean;
  networkId?: NetworkId;
};

export const Notice: FC<NoticeProps> = (props) => {
  const { message, needSwap, needCrossSwap, wrongNetwork, networkId } = props;
  const { t } = useTranslation();

  const showChainSelect = () => {
    modal.show(ChainSelectorDialogId, { networkId });
  };

  const content = useMemo(() => {
    if (wrongNetwork) {
      return t("connector.wrongNetwork.tooltip");
    }

    if (message) {
      return message;
    }

    if (needCrossSwap) {
      return (
        <Text>
          {/* @ts-ignore */}
          <Trans
            i18nKey="transfer.swapDeposit.crossSwap.notice"
            components={[
              <Text
                key="0"
                className="oui-cursor-pointer"
                color="primaryLight"
                onClick={showChainSelect}
              />,
            ]}
          />
        </Text>
      );
    }

    if (needSwap) {
      return t("transfer.swapDeposit.swap.notice");
    }
  }, [message, needSwap, needCrossSwap, wrongNetwork, t]);

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
