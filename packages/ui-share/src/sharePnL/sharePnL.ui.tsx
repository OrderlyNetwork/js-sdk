import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Box } from "@orderly.network/ui";
import { SharePnLState } from "./sharePnL.script";
import { DesktopSharePnLContent } from "./desktop/content";
import { MobileSharePnLContent } from "./mobile/content";

export const DesktopSharePnL: FC<SharePnLState> = (props) => {
  const {
    leverage,
    entity,
    baseDp,
    quoteDp,
    referralInfo,
    shareOptions,
    hide,
  } = props;

  const [viewportHeight, setViewportHeight] = useState(
    window.innerHeight < 900 ? 660 : 807
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight < 900 ? 660 : 807);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (shareOptions == null || entity == null) return <></>;
  return (
    <DesktopSharePnLContent
      entity={entity}
      leverage={leverage}
      hide={hide}
      baseDp={baseDp}
      quoteDp={quoteDp}
      referral={referralInfo}
      shareOptions={shareOptions}
    />
  );
};

export const MobileSharePnL: FC<SharePnLState> = (props) => {
  const {
    leverage,
    entity,
    baseDp,
    quoteDp,
    referralInfo,
    shareOptions,
    hide,
  } = props;
  if (shareOptions == null || entity == null) return <></>;
  return (
    <MobileSharePnLContent
      entity={entity}
      leverage={leverage}
      hide={hide}
      baseDp={baseDp}
      quoteDp={quoteDp}
      referral={referralInfo}
      shareOptions={shareOptions}
    />
  );
};
