import { FC, useCallback, useContext, useMemo, useState } from "react";
import { WalletConnectButton } from "../sections/walletConnectButton";
import { AccountStatusProps } from "../accountStatusBar";
import { AccountStatusEnum } from "@orderly.network/types";
import { Chains } from "../sections/desktop/chains.desktop";
import { cn } from "@/utils/css";
import {
  useMediaQuery,
  useAccount,
  useChains,
  useWalletConnector,
  OrderlyContext,
} from "@orderly.network/hooks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Blockie } from "@/avatar";
import { Text } from "@/text";
import { IconButton } from "@/button";
import { CopyIcon, SvgImage } from "@/icon";
import { toast } from "@/toast";
import { useGetChains } from "../sections/useGetChains";
import { Copy, Share } from "lucide-react";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Divider } from "@/divider";
import { OrderlyAppContext } from "@/provider";
import { DropdownItem } from "@/@types/charting_library";


// 

export interface DesktopDropMenuItem {
  title: string;
  key: any;
}

export const AccountStatus: FC<AccountStatusProps & { className?: string, dropMenuItem?: DesktopDropMenuItem[] | React.ReactNode, onClickDropMenuItem?: (item: DesktopDropMenuItem) => void }> = (
  props
) => {
  const { status = AccountStatusEnum.NotConnected, dropMenuItem, onClickDropMenuItem } = props;
  const { account, state } = useAccount();
  const [open, setOpen] = useState(false);
  const { onWalletDisconnect } =
    useContext(OrderlyAppContext);

  const { networkId, enableSwapDeposit } = useContext<any>(OrderlyContext);
  const { connectedChain } = useWalletConnector();
  const [allChains, { findByChainId }] = useChains("", {
    enableSwapDeposit,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    // filter: (chain: API.Chain) => chain.network_infos?.chain_id === 421613,
  });

  const chains = useMemo(() => {
    if (Array.isArray(allChains)) return allChains;
    if (allChains === undefined) return [];

    if (connectedChain && parseInt(connectedChain.id, 16) === 421613) {
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
    const chainInfo = chains.find((item: any) => item.chain_id === account.chainId);
    if (chainInfo) {
      const { explorer_base_url } = chainInfo;
      if (explorer_base_url) {
        if (explorer_base_url.endsWith("/")) {
          window.open(`${explorer_base_url}address/${account.address}`)
        } else {
          window.open(`${explorer_base_url}/address/${account.address}`)
        }
      }
    }
    setOpen(false);
  }, [state, connectedChain]);

  const isReactNode = useCallback((value: any) => {
    if (typeof value === 'object') {
      return (
        value !== null &&
        (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          typeof value.$$typeof === 'symbol' ||
          Array.isArray(value) && value.every(item => typeof item.$$typeof === 'symbol')
        )
      );
    }

    return false;
  }, []);

  return (
    <div
      className={cn(
        "orderly-h-full orderly-flex orderly-items-center orderly-space-x-2",
        props.className
      )}
    >
      <Chains
        disabled={status < AccountStatusEnum.NotConnected}
        className="orderly-rounded-full"
      />
      <DropdownMenu open={connectedChain ? open : false} onOpenChange={connectedChain ? setOpen : undefined}>
        <DropdownMenuTrigger>
          <WalletConnectButton
            status={status}
            address={props.address}
            className="orderly-rounded-full"
            onConnect={props.onConnect}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className=" orderly-bg-base-800 orderly-w-[220px] orderly-px-4 orderly-pb-4 orderly-rounded-borderRadius orderly-shadow-[0px_12px_20px_0px_rgba(0,0,0,0.25)] orderly-z-20"
          alignOffset={10}
        >

          <DropdownMenuItem>
            <div className="orderly-flex orderly-py-2">
              <div className="orderly-flex-1 orderly-flex orderly-items-center orderly-gap-2">
                <Blockie address={state.address!} />
                <Text className="orderly-text-xs" rule={"address"}>{account.address}</Text>
              </div>
              <div className="orderly-flex orderly-items-center orderly-gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <IconButton type="button" onClick={onCopy} className="orderly-px-0 orderly-ml-2 orderly-w-[20px]">
                      {/*@ts-ignore*/}
                      <Copy size={20} className="orderly-stroke-base-contrast-54" />
                    </IconButton>
                  </TooltipTrigger>
                  <TooltipContent
                    align="center"
                    className="data-[state=delayed-open]:data-[side=top]:orderly-animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:orderly-animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:orderly-animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:orderly-animate-slideUpAndFade orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-px-[15px] orderly-py-[10px] orderly-text-3xs orderly-leading-none orderly-shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] orderly-will-change-[transform,opacity]"
                  >
                    Copy address
                    <TooltipArrow className="orderly-fill-base-400" />
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <IconButton type="button" onClick={onOpenExploer} className="orderly-px-0 orderly-w-[20px]">
                      {/*@ts-ignore*/}
                      <Share size={20} className="orderly-stroke-base-contrast-54" />
                    </IconButton>
                  </TooltipTrigger>
                  <TooltipContent
                    align="end"
                    alignOffset={-20}
                    className="data-[state=delayed-open]:data-[side=top]:orderly-animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:orderly-animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:orderly-animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:orderly-animate-slideUpAndFade orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-px-[15px] orderly-py-[10px] orderly-text-3xs orderly-leading-none orderly-shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] orderly-will-change-[transform,opacity]"
                  >
                    View in block explorer
                    <TooltipArrow className="orderly-fill-base-400" />
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </DropdownMenuItem>

          {(dropMenuItem && Array.isArray(dropMenuItem)) && (<Divider className="orderly-pb-2" />)}
          {(dropMenuItem && Array.isArray(dropMenuItem)) && dropMenuItem.map((item) => {
            return (<DropdownMenuItem>
              <button
                className="orderly-pb-2"
                onClick={() => {
                  if (onClickDropMenuItem) {
                    onClickDropMenuItem(item);
                  }
                }}>
                <span className="orderly-text-base-contrast-36 hover:orderly-text-base-contrast orderly-text-xs" >{item.title}</span>
              </button>
            </DropdownMenuItem>);
          })}

          {/*ts-ignore*/}
          {dropMenuItem && isReactNode(dropMenuItem) && (<DropdownMenuItem>{dropMenuItem}</DropdownMenuItem>)}

          <DropdownMenuItem>
            <div>
              <Divider className="orderly-mb-2" />

              <button onClick={() => {
                setOpen(false);
                onWalletDisconnect?.();
              }}>
                <div className="orderly-flex orderly-w-full orderly-bg-transparent orderly-items-center orderly-fill-base-contrast-36 hover:orderly-fill-danger-light orderly-text-base-contrast-36 hover:orderly-text-danger-light">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={`${24}px`}
                    height={`${24}px`}
                    style={{ fill: 'currentcolor' }}
                  >
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.04498 1.98444L3.92886 2.86832L5.1663 1.63088C6.24024 0.556943 7.98145 0.556943 9.05539 1.63088L11.707 4.28253L12.5909 3.39865L13.6516 4.45931L11.707 6.40386L13.6516 8.3484L12.5909 9.40906L10.6464 7.46452L7.4644 10.6465L9.40894 12.591L8.34828 13.6517L6.40374 11.7072L4.45919 13.6517L3.39853 12.591L4.28242 11.7072L1.63077 9.05551C0.556826 7.98156 0.556826 6.24036 1.63077 5.16642L2.8682 3.92898L1.98432 3.0451L3.04498 1.98444ZM10.6464 5.34319L7.99473 2.69154C7.50657 2.20339 6.71512 2.20339 6.22696 2.69154L2.69143 6.22708C2.20327 6.71523 2.20327 7.50669 2.69143 7.99485L5.34308 10.6465L10.6464 5.34319ZM18.9549 20.0157L18.071 19.1318L16.8336 20.3692C15.7596 21.4432 14.0184 21.4432 12.9445 20.3692L10.2928 17.7176L9.40894 18.6014L8.34828 17.5408L17.5407 8.3484L18.6013 9.40906L17.7174 10.2929L20.3691 12.9446C21.443 14.0185 21.443 15.7597 20.3691 16.8337L19.1317 18.0711L20.0155 18.955L18.9549 20.0157ZM11.3535 16.6569L14.0051 19.3086C14.4933 19.7967 15.2847 19.7967 15.7729 19.3086L19.3084 15.773C19.7966 15.2849 19.7966 14.4934 19.3084 14.0053L16.6568 11.3536L11.3535 16.6569Z" />
                  </svg>
                  <span className="orderly-text-xs orderly-pl-2 orderly-font-semibold">Disconnect</span>
                </div>
              </button>
            </div>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
