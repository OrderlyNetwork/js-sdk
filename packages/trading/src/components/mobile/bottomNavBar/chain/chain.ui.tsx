import { FC } from "react";
import { Box, ChainIcon, Flex, modal, Text, toast } from "@orderly.network/ui";
import { ChainState } from "./chain.script";
import { ChainSelectorSheetId } from "@orderly.network/ui-chain-selector";

export const Chain: FC<ChainState> = (props) => {
  return (
    <button
      onClick={(e) => {
        modal
          .show<{
            wrongNetwork: boolean;
          }>(ChainSelectorSheetId, {
            // networkId: props.networkId,
            bridgeLessOnly: false,
            isWrongNetwork: props.isWrongNetwork,
          })
          .then(
            (r: any) => {
              if (r?.chainId) {
                props.setChainId(r?.chainId);
              }
              toast.success("Network switched");
            },
            (error) => console.log("[switchChain error]", error)
          );
      }}
    >
      <Box className="oui-relative oui-rounded-t-[6px] oui-rounded-bl-[6px] oui-rounded-br-[3px] oui-bg-base-5 oui-px-2 oui-h-7 oui-flex oui-items-center">
        {/* {props.isTestnetChain ? (
          <Text size="2xs" intensity={80}>
            Testnet
          </Text>
        ) : (
          <ChainIcon chainId={props.chainId ?? '1'} size="2xs" />
        )} */}
        <ChainIcon chainId={props.chainId ?? props.defaultChainId} size="2xs" />
        <div className="oui-absolute oui-right-0 oui-bottom-0">
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 6V0L0 9h6a3 3 0 0 0 3-3" fill="url(#a)" />
            <defs>
              <linearGradient
                id="a"
                x1="9"
                y1="4.5"
                x2="0"
                y2="4.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
                <stop
                  offset="1"
                  stopColor="rgb(var(--oui-gradient-brand-start))"
                />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </Box>
    </button>
  );
};
