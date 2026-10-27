import { FC, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  BellIcon,
  DialogHeader,
  DialogBody,
  DialogContent,
  Dialog,
  Popover,
  Divider,
  DialogTitle,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@orderly.network/ui";
import {
  AnnouncementCenterUI,
  type AnnouncementSummary,
} from "@orderly.network/ui-notification";
import { mergeAnnouncementDetailQuery } from "../../utils/announcement";
import { useScaffoldContext } from "../scaffold";
import { selectMessages } from "./selectMessages";

/**
 * Notify bell with Popover (click) + Tooltip (hover) coexisting.
 * - We control Popover open state; when Popover is open, we disable Tooltip to prevent hover/click conflicts.
 * - Both triggers use `asChild` and stack on the same real DOM element to avoid extra wrappers.
 */
export const MessageCenter: FC<{
  maintenanceDialogInfo?: string;
  messages: AnnouncementSummary[];
  platformName?: string;
  showAnnouncement: boolean;
  closeTips: () => void;
  hasUnread?: boolean;
  onOpen?: () => void;
  status?: "loading" | "ready" | "error";
  retry?: () => void;
}> = (props) => {
  const { maintenanceDialogInfo, messages, showAnnouncement, closeTips } =
    props;
  const { routerAdapter } = useScaffoldContext();
  const { t } = useTranslation();
  // Track Popover open to suppress Tooltip while the popover is visible
  const [popoverOpen, setPopoverOpen] = useState(false);

  const onItemClick = (url: string) => {
    if (!url) return;
    const href = mergeAnnouncementDetailQuery(
      url,
      messages.find((item) => item.url === url)?.is_official,
    );
    setPopoverOpen(false);
    routerAdapter?.onRouteChange({
      href,
      name: href,
      target: href.startsWith("/") ? "_self" : "_blank",
    });
  };

  return (
    <>
      {!!maintenanceDialogInfo && (
        <Dialog open>
          <DialogContent
            closable={false}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="oui-w-[320px] lg:oui-w-auto"
          >
            <DialogHeader>
              <DialogTitle>{t("maintenance.dialog.title")}</DialogTitle>
            </DialogHeader>
            <Divider />
            <DialogBody className="oui-text-2xs lg:oui-text-xs">
              {maintenanceDialogInfo}
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
      <TooltipProvider delayDuration={250}>
        {/* When the Popover is open, force Tooltip closed to avoid dual overlays */}
        <TooltipRoot open={popoverOpen ? false : undefined}>
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (open) {
                (props.onOpen ?? closeTips)();
              }
            }}
            arrow
            content={
              <AnnouncementCenterUI
                dataSource={selectMessages(messages)}
                platformName={props.platformName}
                status={props.status}
                retry={props.retry}
                onItemClick={onItemClick}
                onViewAll={() => {
                  const search = new URLSearchParams(window.location.search);
                  search.delete("category");
                  search.delete("page");
                  onItemClick(`/announcement?${search.toString()}`);
                }}
              />
            }
            contentProps={{
              align: "end",
              className: "oui-w-[360px] oui-shadow-xl oui-p-0",
            }}
          >
            {/* Stack TooltipTrigger and PopoverTrigger (via Popover's asChild) on the same element */}
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t("ui.messageCenter.tooltip")}
                className="oui-relative oui-flex oui-cursor-pointer oui-items-center oui-justify-center"
              >
                <BellIcon
                  color="white"
                  opacity={0.8}
                  size={20}
                  viewBox="0 0 20 20"
                  className="hover:oui-opacity-100"
                />
                {(props.hasUnread ??
                  (messages.length > 0 && showAnnouncement)) && (
                  <span
                    aria-label={t("notification.newAnnouncements")}
                    className="oui-absolute -oui-end-1 -oui-top-1 oui-size-2 oui-rounded-full oui-bg-danger"
                  />
                )}
              </button>
            </TooltipTrigger>
          </Popover>
          <TooltipContent side="bottom">
            {t("ui.messageCenter.tooltip")}
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    </>
  );
};
