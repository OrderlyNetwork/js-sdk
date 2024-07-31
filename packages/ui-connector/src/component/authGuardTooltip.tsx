import { useAccount } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { Tooltip } from "@orderly.network/ui";
import { PropsWithChildren, useMemo } from "react";

type AuthGuardProps = {
  content?: string;
  align?: "center" | "end" | "start";
  alignOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  opactiy?: number;
};

const AuthGuardTooltip = (props: PropsWithChildren<AuthGuardProps>) => {
  const { opactiy = 90 } = props;
  const { state } = useAccount();
  const isSupport = true;
  const { wrongNetwork } = useAppContext();


  const hint = useMemo(() => {
    if (wrongNetwork) {
      return "Please switch to a supported network to set up";
    }
    switch (state.status) {
      case AccountStatusEnum.NotConnected:
        return "Please Connect wallet before set up";
      case AccountStatusEnum.NotSignedIn:
        return "Please Sign before set up";
      case AccountStatusEnum.DisabledTrading:
        return "Please Enable trading before set up";
      case AccountStatusEnum.EnableTrading: {
        if (!isSupport) return "Please switch to a supported network to set up";
        return "";
      }
      default:
        return props.content;
    }
  }, [props.content, state, isSupport]);

  const newOpacity = useMemo(() => {
    switch (state.status) {
      case AccountStatusEnum.NotConnected:
      case AccountStatusEnum.NotSignedIn:
        return opactiy;
      case AccountStatusEnum.EnableTrading: {
        if (!isSupport) return opactiy;
        return undefined;
      }
      default:
        return undefined;
    }
  }, [props.opactiy, state, isSupport]);
  

  return (
    <Tooltip
      content={hint}
      className="oui-text-2xs"
      align={props.align}
      alignOffset={props.alignOffset}
      side={props.side}
      sideOffset={props.sideOffset}
    >
      <div
        style={{
          opacity: newOpacity,
        }}
      >
        {props.children}
      </div>
    </Tooltip>
  );
};

AuthGuardTooltip.displayName = "AuthGuardTooltip";

export { AuthGuardTooltip };
