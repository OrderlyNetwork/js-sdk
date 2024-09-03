import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Box } from "@orderly.network/ui";
import { SharePnLState } from "./sharePnL.script";
import { DesktopSharePnLContent } from "./desktop/content";


export const DesktopSharePnL: FC<SharePnLState> = (props) => {

  console.log("xxxxxx DesktopSharePnL props", props);
  
  const { leverage, position, baseDp, quoteDp, referralInfo, shareOptions } =
    props;

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
  return (
    <DesktopSharePnLContent
      position={position}
      leverage={`${leverage}`}
      hide={props.hide}
      baseDp={props.baseDp}
      quoteDp={props.quoteDp}
      referral={props.referralInfo}
      shareOptions={shareOptions}
    />
  );
};

export const MobileSharePnL: FC<SharePnLState> = (props) => {
  const { leverage, position, baseDp, quoteDp, referralInfo, shareOptions } =
    props;
  // const { visible, hide, resolve, reject, onOpenChange } = useModal();

  /*、
  <MobileSharePnLContent
          position={position}
          leverage={leverage}
          hide={hide}
          baseDp={baseDp}
          quoteDp={quoteDp}
          referral={referral}
          shareOptions={shareOptions}
        /> 
  */
  return <Box>Mweb</Box>;
};
