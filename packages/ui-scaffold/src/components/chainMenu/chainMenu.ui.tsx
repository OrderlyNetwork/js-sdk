import { useAccount } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { AccountStatusEnum } from "@veltodefi/types";
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
  Spinner,
  Text,
} from "@veltodefi/ui";
import {
  ChainSelectorDialogId,
  ChainSelectorWidget,
} from "@veltodefi/ui-chain-selector";
import { WalletConnectorModalId } from "@veltodefi/ui-connector";
import { UseChainMenuScriptReturn } from "./chainMenu.script";

const ModalTitle = () => {
  const { t } = useTranslation();
  const { state } = useAccount();
  if (state.status < AccountStatusEnum.SignedIn) {
    return <Text>{t("connector.createAccount")}</Text>;
  }
  if (state.status < AccountStatusEnum.EnableTrading) {
    return <Text>{t("connector.enableTrading")}</Text>;
  }
  return <Text>{t("connector.connectWallet")}</Text>;
};

export const ChainMenu = (props: UseChainMenuScriptReturn) => {
  const { t } = useTranslation();

  if (props.wrongNetwork && props.isConnected && !props.disabledConnect) {
    return (
      <Tooltip
        open
        hideWhenDetached
        content={t("connector.wrongNetwork.tooltip")}
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
                    modal
                      .show(WalletConnectorModalId, {
                        title: <ModalTitle />,
                      })
                      .then(
                        (r) => console.log(r),
                        (error) => console.log(error),
                      );
                  }
                },
                (error) => console.log(error),
              );
          }}
        >
          {t("connector.wrongNetwork")}
        </Button>
      </Tooltip>
    );
  }

  const renderIcon = () => {
    if (props.loading) {
      return <Spinner className="oui-w-[18px] oui-h-[18px]" />;
    }

    if (props.currentChainId) {
      return <ChainIcon chainId={props.currentChainId} size="xs" />;
    }
  };

  const trigger = (
    <Flex
      intensity={500}
      justify="center"
      className={cn(
        "oui-relative oui-cursor-pointer",
        "oui-w-11 oui-h-8",
        "oui-rounded-t-[6px] oui-rounded-bl-[6px] oui-rounded-br-[3px]",
      )}
    >
      {renderIcon()}
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
            "oui-font-semibold",
          )}
        >
          <ChainSelectorWidget
            close={props.hide}
            onChainChangeBefore={props.onChainChangeBefore}
            onChainChangeAfter={props.onChainChangeAfter}
          />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
