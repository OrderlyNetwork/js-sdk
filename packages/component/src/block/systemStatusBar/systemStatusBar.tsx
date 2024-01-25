import { Divider } from "@/divider";
import { FC, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { NetworkStatus } from "./networkStatus";
import {
  CommunityDiscord,
  CommunityX,
  CommunityTG,
} from "./communityIcon";
import { OrderlyLogo } from "./orderlyLogo";
import { useWS } from "@orderly.network/hooks";
import React from "react";

export interface FooterStatusBarProps {
  xUrl?: string;
  telegramUrl?: string;
  discordUrl?: string;
  commutitylist?: React.ReactNode[];
  powerBy?: string | React.ReactNode;
}

export const SystemStatusBar: FC<FooterStatusBarProps> = (props) => {
  const {
    xUrl,
    telegramUrl,
    discordUrl,
    commutitylist,
    powerBy = <OrderlyLogo />,
  } = props;

  const ws = useWS();
  const [wsStatus, setWsStatus] = useState<
    "connected" | "unstable" | "disconnected"
  >(ws.client.public.readyState ? "connected" : "disconnected");
  const connectCount = useRef(0);

  useEffect(() => {
    ws.on("status:change", (status: any) => {
      // setWsStatus(status === "connecting" ? "disconnected" : status);
      // console.log("ws status", status);

      const { type, isPrivate } = status;
      if (!isPrivate) {
        switch (type) {
          case "open":
            connectCount.current = 0;
            setWsStatus("connected");
            break;
          case "close":
            connectCount.current = 0;
            setWsStatus("disconnected");
            break;
          case "reconnecting":
            connectCount.current++;
            if (connectCount.current >= 3) {
              setWsStatus("unstable");
            }
            break;
        }
      }
    });
    return () => ws.off("websocket:status", () => { });
  }, []);

  const children = useMemo(() => {

    if (commutitylist !== undefined) {
      return commutitylist;
    }

    const children: React.ReactNode[] = [];
    if (telegramUrl !== undefined) {
      children.push(<button onClick={() => {
        window.open(telegramUrl, "_blank");
      }}>
        <CommunityTG/>
      </button>);
    }
    if (discordUrl !== undefined) {
      children.push(<button onClick={() => {
        window.open(discordUrl, "_blank");
      }}>
        <CommunityDiscord/>
      </button>);
    }
    if (xUrl !== undefined) {
      children.push(<button onClick={() => {
        window.open(xUrl, "_blank");
      }}>
        <CommunityX/>
      </button>);
    }


    return children;

  }, [
    xUrl,
    telegramUrl,
    discordUrl,
    commutitylist,
  ]);

  return (
    <>
      <div className="orderly-flex orderly-items-center">
        <NetworkStatus state={wsStatus} />
        <div className="orderly-pl-2">
          <Divider vertical />
        </div>

        <span className="orderly-text-base-contrast-54 orderly-text-4xs orderly-font-semibold orderly-pr-2">
          Join our community
        </span>

        {children.map((item) => item)}
      </div>

      <div className="orderly-flex orderly-items-center">
        <span className="orderly-text-base-contrast-54 orderly-text-4xs orderly-font-semibold orderly-pr-2 orderly-justify-end">
          Powered by
        </span>
        {powerBy}
      </div>
    </>
  );
};
