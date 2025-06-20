import React, { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AnnouncementType } from "@orderly.network/types";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  cn,
  DialogTitle,
  DialogHeader,
  Dialog,
  DialogBody,
  DialogContent,
  Divider,
  Flex,
  useScreen,
  Text,
} from "@orderly.network/ui";
import { CloseIcon } from "../icons";
import { AnnouncementScriptReturn } from "./announcement.script";

export type AnnouncementProps = AnnouncementScriptReturn & {
  style?: React.CSSProperties;
  className?: string;
  hideTips?: boolean;
};

export const Announcement: React.FC<Readonly<AnnouncementProps>> = (props) => {
  const { maintenanceDialogInfo, showAnnouncement, currentTip } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const contentNode = React.useMemo<React.ReactNode>(() => {
    if (!currentTip) {
      return null;
    }
    if (isMobile) {
      return <MobileTips {...props} />;
    }
    return <DeskTopTips {...props} />;
  }, [currentTip, isMobile, props]);

  if (maintenanceDialogInfo) {
    return (
      <Dialog open={true}>
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
    );
  }

  if (!showAnnouncement) {
    return null;
  }

  return (
    <Flex
      key={currentTip?.announcement_id}
      style={props.style}
      className={cn(
        "oui-announcement",
        "oui-overflow-hidden oui-rounded-xl oui-font-semibold",
        props.className,
      )}
    >
      {contentNode}
    </Flex>
  );
};

const DeskTopTips: React.FC<Readonly<AnnouncementScriptReturn>> = (props) => {
  const {
    currentTip,
    currentIndex,
    tips,
    prevTips,
    nextTips,
    closeTips,
    mutiLine,
    contentRef,
    isAnimating,
  } = props;

  const len = tips.length;

  const { i18n } = useTranslation();

  return (
    <>
      <Flex
        justify="center"
        width="100%"
        py={2}
        pl={4}
        gapX={2}
        itemAlign={mutiLine ? "start" : "center"}
        className={cn(
          "oui-mr-[125px] oui-relative oui-overflow-hidden",
          currentTip?.url && "oui-cursor-pointer",
          "oui-transition-transform oui-duration-200 oui-ease-in-out oui-opacity-100",
          isAnimating && "oui-translate-y-1/2 oui-opacity-0",
        )}
        onClick={() => {
          if (currentTip?.url) {
            window.open(currentTip?.url, "_blank");
          }
        }}
      >
        <RenderTipsType type={currentTip?.type} />
        <Text
          size="xs"
          intensity={80}
          ref={contentRef}
          className="oui-leading-[18px]"
        >
          {currentTip?.i18n?.[i18n.language] || currentTip?.message}
        </Text>
      </Flex>
      <Flex
        gapX={4}
        justify="center"
        className={cn(
          "oui-absolute oui-right-4 oui-top-2/4 -oui-translate-y-2/4",
        )}
      >
        <SwitchTips
          currentIndex={currentIndex}
          tipsCount={len}
          prevTips={prevTips}
          nextTips={nextTips}
        />
        <CloseIcon
          onClick={closeTips}
          size={20}
          className="oui-text-base-contrast-80 hover:oui-text-base-contrast"
        />
      </Flex>
    </>
  );
};

const MobileTips: React.FC<Readonly<AnnouncementScriptReturn>> = (props) => {
  const {
    currentTip,
    currentIndex,
    tips,
    prevTips,
    nextTips,
    closeTips,
    isAnimating,
  } = props;

  const len = tips.length;

  const { i18n } = useTranslation();

  return (
    <Flex
      p={3}
      gapX={2}
      itemAlign="start"
      width="100%"
      className="oui-relative oui-overflow-hidden"
    >
      <Flex
        gapY={2}
        direction="column"
        className={cn("oui-items-start oui-justify-start oui-w-full")}
      >
        <div
          // className={cn(
          //   "oui-transition-transform oui-duration-200 oui-ease-in-out oui-opacity-100",
          //   isAnimating && "oui-translate-y-full oui-opacity-0"
          // )}
          className={cn("oui-w-full", currentTip?.url && "oui-cursor-pointer")}
          onClick={() => {
            if (currentTip?.url) {
              window.open(currentTip?.url, "_blank");
            }
          }}
        >
          <Text size="xs" className="oui-leading-5" intensity={80}>
            {currentTip?.i18n?.[i18n.language] || currentTip?.message}
          </Text>
        </div>

        <Flex width="100%" justify="between">
          <div
          // className={cn(
          //   "oui-transition-transform oui-duration-200 oui-ease-in-out oui-opacity-100",
          //   isAnimating && "oui-translate-y-full oui-opacity-0"
          // )}
          >
            <RenderTipsType type={currentTip?.type} />
          </div>
          <SwitchTips
            currentIndex={currentIndex}
            tipsCount={len}
            prevTips={prevTips}
            nextTips={nextTips}
          />
        </Flex>
      </Flex>
      <CloseIcon onClick={closeTips} size={18} className="oui-mt-[2px]" />
    </Flex>
  );
};

type SwitchTipsProps = {
  tipsCount: number;
} & Pick<AnnouncementScriptReturn, "currentIndex" | "prevTips" | "nextTips">;

const SwitchTips: React.FC<Readonly<SwitchTipsProps>> = (props) => {
  const { currentIndex, tipsCount, prevTips, nextTips } = props;
  return (
    <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 oui-text-base-contrast-54">
      <ChevronLeftIcon
        size={20}
        opacity={1}
        className=" oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-flex-shrink-0 oui-w-4 lg:oui-w-5 oui-h-4 lg:oui-h-5 oui-cursor-pointer "
        onClick={prevTips}
      />
      <div className="oui-text-base-contrast-54 oui-text-sm">
        {currentIndex + 1}/{tipsCount}
      </div>
      <ChevronRightIcon
        size={20}
        opacity={1}
        className="oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-flex-shrink-0 oui-w-4 lg:oui-w-5 oui-h-4 lg:oui-h-5 oui-cursor-pointer "
        onClick={nextTips}
      />
    </div>
  );
};

const RenderTipsType: React.FC<{ type?: AnnouncementType | null }> = ({
  type,
}) => {
  const { t } = useTranslation();

  const { label, className } = useMemo(() => {
    const map: Record<AnnouncementType, { label: string; className: string }> =
      {
        [AnnouncementType.Listing]: {
          label: t("announcement.type.listing"),
          className: "oui-bg-primary/15 oui-text-primary",
        },
        [AnnouncementType.Maintenance]: {
          label: t("announcement.type.maintenance"),
          className: "oui-bg-[rgba(232,136,0,0.15)] oui-text-warning-darken",
        },
        [AnnouncementType.Delisting]: {
          label: t("announcement.type.delisting"),
          className: "oui-bg-[rgba(232,136,0,0.15)] oui-text-warning-darken",
        },
      };
    return (
      map[type!] || {
        label: type,
        className: map[AnnouncementType.Listing].className,
      }
    );
  }, [type, t]);

  if (!label) {
    return null;
  }

  return (
    <Flex
      justify="center"
      px={2}
      r="base"
      className={cn(
        "oui-text-2xs oui-leading-[18px] oui-font-medium",
        "oui-break-normal oui-whitespace-nowrap",
        className,
      )}
    >
      {label}
    </Flex>
  );
};
