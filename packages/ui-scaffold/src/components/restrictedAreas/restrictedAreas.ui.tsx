import { FC } from "react";
import { RestrictedInfo } from "./restrictedAreas.script";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Divider,
} from "@orderly.network/ui";

export const RestrictedAreas: FC<RestrictedInfo> = (props: RestrictedInfo) => {
  const modalTitle = "We're sorry...";
  return (
    <>
      <Dialog open={props.restrictedAreasOpen}>
        <DialogContent
          closable={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="oui-w-[480px] md:oui-w-[480px] sm:oui-w-[320px]"
        >
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <Divider />
          <DialogBody className="oui-text-xs md:oui-text-xs sm:oui-text-2xs">
            <div>
              It seems you are accessing {props.brokerName} from an IP address (
              {props?.ip}) belonging to one of the following countries/regions:
            </div>
            <div>
              {props.invalidRegions?.join(", ")} , or a restricted IP address
            </div>
            <br />
            {props?.contact?.url && props?.contact?.text && (
              <div>
                Please noted that accessing Orderly Network is not available
                from the countries listed above. If you are not in one of those
                regions and belive this message was received in error, please
                contact{" "}
                <a
                  className="oui-text-link"
                  href={`${props?.contact?.url}`}
                  target="_blank"
                >
                  {props?.contact?.text}
                </a>
                .
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};
