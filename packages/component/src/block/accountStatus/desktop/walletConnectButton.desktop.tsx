import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { WalletConnectButton } from "../sections/walletConnectButton";
import { AccountStatusProps } from "../accountStatusBar";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Blockie } from "@/avatar";
import { Text } from "@/text";
import { toast } from "@/toast";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Divider } from "@/divider";
import { OrderlyAppContext } from "@/provider";
import { DesktopDropMenuItem } from "./accountStatus.desktop";
import { isTestnet } from "@orderly.network/utils";
import { CopyDesktopIcon, DisconnectIcon, ShareIcon } from "@/icon";
import { cn } from "@/utils";

const IconTooltip = (props: { trigger: ReactNode; tooltipContent: string }) => (
  <Tooltip>
    <TooltipTrigger>{props.trigger}</TooltipTrigger>
    <TooltipContent
      align="center"
      className="data-[state=delayed-open]:data-[side=top]:orderly-animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:orderly-animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:orderly-animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:orderly-animate-slideUpAndFade orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-px-[15px] orderly-py-[10px] orderly-text-3xs orderly-leading-none orderly-shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] orderly-will-change-[transform,opacity]"
    >
      {props.tooltipContent}
      <TooltipArrow className="orderly-fill-base-400" />
    </TooltipContent>
  </Tooltip>
);

const MenuItem = (props: {
  icon: ReactNode;
  title: string;
  className?: string;
  onClick: () => void;
}) => (
  <div
    className={cn(
      "orderly-flex orderly-cursor-pointer orderly-items-center orderly-w-full orderly-fill-base-contrast-36 orderly-text-base-contrast-36 hover:orderly-fill-base-contrast hover:orderly-text-base-contrast orderly-py-4",
      props.className
    )}
    onClick={props.onClick}
  >
    {props.icon}
    <span className="orderly-text-xs orderly-pl-2 orderly-font-semibold">
      {props.title}
    </span>
  </div>
);

export const DesktopWalletConnnectButton: FC<
  AccountStatusProps & {
    className?: string;
    dropMenuItem?: DesktopDropMenuItem[] | React.ReactNode;
    onClickDropMenuItem?: (item: DesktopDropMenuItem) => void;
  }
> = (props) => {
  const {
    status = AccountStatusEnum.NotConnected,
    dropMenuItem,
    onClickDropMenuItem,
  } = props;
  const { account, state } = useAccount();
  const [open, setOpen] = useState(false);
  const { onWalletDisconnect } = useContext(OrderlyAppContext);

  const { connectedChain } = useWalletConnector();
  const [allChains] = useChains(undefined, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    // filter: (chain: API.Chain) => isTestnet(chain.network_infos?.chain_id),
  });

  const chains = useMemo(() => {
    if (Array.isArray(allChains)) return allChains;
    if (allChains === undefined) return [];

    // @ts-ignore
    if (connectedChain && isTestnet(parseInt(connectedChain.id))) {
      return allChains.testnet ?? [];
    }

    return allChains.mainnet;
  }, [allChains, connectedChain]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(state.address!).then(() => {
      toast.success("Copied to clipboard");
      setOpen(false);
    });
  }, [state]);

  const onOpenExploer = useCallback(() => {
    const chainInfo = chains.find(
      (item: any) => item.chain_id === account.chainId
    );
    if (chainInfo) {
      // @ts-ignore
      const { explorer_base_url } = chainInfo;
      if (explorer_base_url) {
        if (explorer_base_url.endsWith("/")) {
          window.open(`${explorer_base_url}address/${account.address}`);
        } else {
          window.open(`${explorer_base_url}/address/${account.address}`);
        }
      }
    }
    setOpen(false);
  }, [state, connectedChain]);

  const customsMenuItems = useMemo(() => {
    if (Array.isArray(props.dropMenuItem)) {
      return props.dropMenuItem.map((item) => {
        return (
          <div key={item.key || item.title}>
            <MenuItem
              icon={item.icon}
              title={item.title}
              className={item.className}
              onClick={() => {
                item.onClick?.();
                onClickDropMenuItem?.(item);
              }}
            />
            <Divider />
          </div>
        );
      });
    }
    return <>{props.dropMenuItem}</>;
  }, [props.dropMenuItem, props.onClickDropMenuItem]);

  return (
    <DropdownMenu
      open={state.address ? open : false}
      onOpenChange={state.address ? setOpen : undefined}
    >
      <DropdownMenuTrigger>
        <div className="orderly-h-[48px] orderly-flex orderly-items-center">
          <WalletConnectButton
            status={status}
            address={props.address}
            className="orderly-rounded-full"
            onConnect={props.onConnect}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="orderly-bg-base-800 orderly-w-[220px] orderly-px-4 orderly-rounded-borderRadius orderly-shadow-[0px_12px_20px_0px_rgba(0,0,0,0.25)] orderly-z-50"
        alignOffset={10}
        onCloseAutoFocus={(e) => e.preventDefault()}
        // sideOffset={14}
      >
        <div className="orderly-flex  orderly-gap-3 orderly-py-5">
          <div className="orderly-flex-1 orderly-flex orderly-items-center">
            <Blockie address={state.address!} />
            <Text
              className="orderly-text-xs orderly-text-base-contrast-80 orderly-ml-2"
              rule={"address"}
            >
              {account.address}
            </Text>
          </div>

          <IconTooltip
            trigger={
              <CopyDesktopIcon
                onClick={onCopy}
                size={20}
                className="orderly-text-base-contrast-36 hover:orderly-text-base-contrast"
              />
            }
            tooltipContent="Copy address"
          />

          <IconTooltip
            trigger={
              <ShareIcon
                onClick={onOpenExploer}
                size={20}
                className="orderly-text-base-contrast-36 hover:orderly-text-base-contrast"
              />
            }
            tooltipContent="View in block explorer"
          />
        </div>

        {customsMenuItems}

        <MenuItem
          icon={<DisconnectIcon size={24} />}
          title="Disconnect"
          className="hover:orderly-fill-danger-light hover:orderly-text-danger-light"
          onClick={() => {
            setOpen(false);
            onWalletDisconnect?.();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
