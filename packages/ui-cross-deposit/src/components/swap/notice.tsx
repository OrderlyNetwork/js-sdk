import { FC, useMemo } from "react";
import { useTranslation, Trans } from "@orderly.network/i18n";
import { NetworkId } from "@orderly.network/types";
import { Box, Text } from "@orderly.network/ui";
import { modal } from "@orderly.network/ui";
import { ChainSelectorDialogId } from "@orderly.network/ui-chain-selector";

type NoticeProps = {
  message?: string;
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
            i18nKey="transfer.crossDeposit.crossSwap.notice"
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
      return t("transfer.crossDeposit.swap.notice");
    }
  }, [message, needSwap, needCrossSwap, wrongNetwork, t]);

  if (content) {
    return (
      <Box mb={3} className="oui-text-center oui-text-xs oui-text-[#FF7D00]">
        {content}
      </Box>
    );
  }

  return null;
};
