import { FC, useMemo } from "react";
import { Box, Text } from "@orderly.network/ui";
import { modal } from "@orderly.network/ui";
import { ChainSelectorDialogId } from "@orderly.network/ui-chain-selector";
import { NetworkId } from "@orderly.network/types";

type NoticeProps = {
  message?: string;
  needSwap?: boolean;
  needCrossSwap?: boolean;
  wrongNetwork?: boolean;
  networkId?: NetworkId;
};

export const Notice: FC<NoticeProps> = (props) => {
  const { message, needSwap, needCrossSwap, wrongNetwork, networkId } = props;

  const showChainSelect = () => {
    modal.show(ChainSelectorDialogId, { networkId });
  };

  const content = useMemo(() => {
    if (wrongNetwork) {
      return "Please connect to a supported network.";
    }

    if (message) {
      return message;
    }

    if (needCrossSwap) {
      return (
        <Text className="">
          <span>
            Cross-chain transaction fees will be charged. To avoid these, use
            our supported
          </span>
          <Text
            className="oui-cursor-pointer"
            color="primaryLight"
            onClick={showChainSelect}
          >
            {" "}
            Bridgeless networks
          </Text>
        </Text>
      );
    }

    if (needSwap) {
      return "Please note that swap fees will be charged.";
    }
  }, [message, needSwap, needCrossSwap, wrongNetwork]);

  if (content) {
    return (
      <Box mb={3} className="oui-text-center oui-text-xs oui-text-[#FF7D00]">
        {content}
      </Box>
    );
  }

  return null;
};
