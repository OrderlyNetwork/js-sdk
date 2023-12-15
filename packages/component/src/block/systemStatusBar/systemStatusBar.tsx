import { Divider } from "@/divider";
import { FC, ReactElement, useEffect, useRef, useState } from "react";
import { NetworkStatus } from "./networkStatus";
import { CommunityDiscord, CommunityFB, CommunityTG, CommunityType } from "./communityIcon";
import { OrderlyLogo } from "./orderlyLogo";
import Button from "@/button";
import { useWS } from "@orderly.network/hooks";


export interface SystemStatusBarProps {
    commutitylist?: CommunityType[] | React.ReactElement[] | null;
    onClickComutity?: (item: any) => void;
    powerBy?: string | React.ReactElement;
}

export const SystemStatusBar: FC<SystemStatusBarProps> = (props) => {
    const { commutitylist = [CommunityType.facebook, CommunityType.discord, CommunityType.telegram], onClickComutity, powerBy = <OrderlyLogo /> } = props;

    const [wsStatus, setWsStatus] = useState<"connected" | "unstable" | "disconnected">("disconnected");
    const ws = useWS();
    const connectCount = useRef(0);

    useEffect(() => {
        ws.on("status:change", (status: any) => {
            // setWsStatus(status === "connecting" ? "disconnected" : status);
            console.log("ws status", status);

            const { type } = status;
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

        });
        return () => ws.off("websocket:status");
    }, []);

    function clickCommunity(item: any) {

        if (onClickComutity) {
            onClickComutity(item);
        }
    }

    return (<>
        <div className="orderly-position-fixed orderly-bottom-0 orderly-left-0 orderly-right-0 orderly-flex orderly-items-center orderly-px-4 orderly-w-full orderly-h-[42px] orderly-justify-between">
            <div className="orderly-flex orderly-items-center">
                <NetworkStatus state={wsStatus} />
                <div className="orderly-pl-2"><Divider vertical /></div>

                <span className="orderly-text-base-contrast-54 orderly-text-4xs orderly-font-semibold orderly-pr-2">Join our community</span>

                {commutitylist && commutitylist.map((item) => {
                    if (item === CommunityType.facebook) {
                        return (<button

                            onClick={() => clickCommunity(item)}>
                            <CommunityFB className="orderly-mr-2" />
                        </button>);
                    } else if (item === CommunityType.discord) {
                        return (<button
                            onClick={() => clickCommunity(item)}>
                            <CommunityDiscord className="orderly-mr-2" />
                        </button>);
                    }
                    else if (item === CommunityType.telegram) {
                        return (<button
                            onClick={() => clickCommunity(item)}>
                            <CommunityTG className="orderly-mr-2" />
                        </button>);
                    } else {
                        return (<button
                            onClick={() => clickCommunity(item)}>
                            {item}
                        </button>);
                    }
                })}

            </div>


            <div className="orderly-flex orderly-items-center">
                <span className="orderly-text-base-contrast-54 orderly-text-4xs orderly-font-semibold orderly-pr-2 orderly-justify-end">Powered by</span>
                {powerBy}
            </div>


        </div>
    </>);
}