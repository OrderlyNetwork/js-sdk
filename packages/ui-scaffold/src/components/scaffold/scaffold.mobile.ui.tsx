import { PropsWithChildren } from "react";
import { AnnouncementWidget } from "../announcement";
import { RestrictedInfoWidget } from "../restrictedInfo";
import { ScaffoldScriptReturn } from "./scaffold.script";

type MobileScaffoldProps = PropsWithChildren<ScaffoldScriptReturn>;

export const MobileScaffold = (props: MobileScaffoldProps) => {
  return (
    <>
      <RestrictedInfoWidget className="oui-bg-base-6 oui-mx-1 oui-mb-1" />

      <AnnouncementWidget
        className="oui-bg-base-6 oui-mx-1 oui-mb-1"
        hideTips={props.restrictedInfo?.restrictedOpen}
      />

      {props.children}
    </>
  );
};
