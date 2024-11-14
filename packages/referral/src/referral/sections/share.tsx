import { useContext, useMemo } from "react";
import { ShareIcon } from "../icons/share";
import { ListTile } from "./listTile";
import { ReferralContext } from "../../hooks/referralContext";
import { useTranslation } from "../../locale/useTranslation";

export const Share = () => {


  const { overwrite } = useContext(ReferralContext);
  const tr = useTranslation();
  const icon = useMemo(() => {
    if (typeof overwrite?.ref?.step === 'object') {
      return overwrite?.ref?.step?.shareIcon;
    }


    return <ShareIcon width={"100%"} height="100%" className="orderly-fill-primary-darken" />

  }, [overwrite]);



  return (
    <ListTile
      icon={<div className="orderly-h-[60px] orderly-w-[60px] lg:orderly-w-[80px] lg:orderly-h-[80px]">{icon}</div>}
      title={tr("referral.step.share.title")}
      subtitle={tr("referral.step.share.subtitle")}
    />
  );
};
