import { AccountStatusEnum } from "@orderly.network/types";
import {
  Button,
  ChainIcon,
  cn,
  Flex,
  modal,
  Tooltip,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@orderly.network/ui";
import {
  ChainSelectorDialogId,
  ChainSelectorWidget,
} from "@orderly.network/ui-chain-selector";
import { WalletConnectorModalId } from "@orderly.network/ui-connector";
import { UseChainMenuScriptReturn } from "./chainMenu.script";

export const ChainMenu = (props: UseChainMenuScriptReturn) => {
  if (props.wrongNetwork && props.isConnected) {
    return (
      <Tooltip
        open
        hideWhenDetached
        content={"Please switch to a supported network to continue."}
        className="oui-bg-base-5"
        arrow={{ className: "oui-fill-base-5" }}
      >
        <Button
          color="warning"
          size="md"
          onClick={() => {
            modal
              .show<{ wrongNetwork: boolean }>(ChainSelectorDialogId, {
                networkId: props.networkId,
              })
              .then(
                (r) => {
                  if (
                    !r.wrongNetwork &&
                    props.accountStatus < AccountStatusEnum.EnableTrading
                  ) {
                    modal.show(WalletConnectorModalId).then(
                      (r) => console.log(r),
                      (error) => console.log(error)
                    );
                  }
                },
                (error) => console.log(error)
              );
          }}
        >
          Wrong network
        </Button>
      </Tooltip>
    );
  }

  const trigger = (
    <Flex
      intensity={500}
      justify="center"
      className={cn(
        "oui-relative oui-cursor-pointer",
        "oui-w-11 oui-h-8",
        "oui-rounded-t-[6px] oui-rounded-bl-[6px] oui-rounded-br-[3px]"
      )}
    >
      {!!props.currentChainId && (
        <ChainIcon chainId={props.currentChainId} size="xs" />
      )}
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        className="oui-absolute oui-right-0 oui-bottom-0"
      >
        <defs>
          <linearGradient
            id="paint0_linear_490_5080"
            x1="10"
            y1="5"
            x2="-5.79673e-08"
            y2="5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
            <stop offset="1" stopColor="rgb(var(--oui-gradient-brand-start))" />
          </linearGradient>
        </defs>
        <path
          d="M10 7V0L0 10H7C8.65685 10 10 8.65685 10 7Z"
          fill="url(#paint0_linear_490_5080)"
        />
      </svg>
    </Flex>
  );

  return (
    <DropdownMenuRoot open={props.open} onOpenChange={props.onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          sideOffset={4}
          collisionPadding={{ right: 16 }}
          className={cn(
            "oui-bg-base-8 oui-w-[456px] oui-p-4 oui-rounded-xl",
            "oui-border oui-border-line-6",
            "oui-font-semibold"
          )}
        >
          <ChainSelectorWidget
            close={props.hide}
            onChainBeforeChange={props.onChainBeforeChange}
          />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
