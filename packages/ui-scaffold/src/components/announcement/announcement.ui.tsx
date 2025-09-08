import React, { useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslation } from "@orderly.network/i18n";
import { AnnouncementType, type API } from "@orderly.network/types";
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
  Marquee,
} from "@orderly.network/ui";
import { CloseIcon } from "../icons";
import type { AnnouncementScriptReturn } from "./announcement.script";

export type AnnouncementProps = AnnouncementScriptReturn & {
  style?: React.CSSProperties;
  className?: string;
  hideTips?: boolean;
};

export const AnnouncementUI: React.FC<Readonly<AnnouncementProps>> = (
  props,
) => {
  const {
    maintenanceDialogInfo,
    showAnnouncement,
    tips,
    currentTip,
    contentRef,
  } = props;
  const { t, i18n } = useTranslation();
  const { isMobile } = useScreen();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      axis: "y",
    },
    [Autoplay({ delay: 2000, stopOnInteraction: false })],
  );

  // return (
  //   <div className="oui-mx-auto oui-w-full oui-transform-gpu">
  //     <div
  //       ref={emblaRef}
  //       className="oui-h-5 oui-transform-gpu oui-overflow-hidden oui-rounded-xl"
  //     >
  //       <div className="oui-flex oui-h-full oui-transform-gpu oui-flex-col">
  //         {tips.map((item) => (
  //           <Flex
  //             height={"100%"}
  //             justify="center"
  //             itemAlign="center"
  //             className="oui-flex-none oui-basis-full oui-transform-gpu"
  //             key={item.id}
  //           >
  //             <RenderTipsType type={item?.type} />
  //             <Text
  //               size="xs"
  //               intensity={80}
  //               ref={contentRef}
  //               className="oui-h-5 oui-transform-gpu oui-leading-5"
  //             >
  //               {item?.i18n?.[i18n.language] || item?.message}
  //             </Text>
  //           </Flex>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );

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
          "oui-relative oui-mr-[125px] oui-overflow-hidden",
          currentTip?.url && "oui-cursor-pointer",
          "oui-opacity-100 oui-transition-transform oui-duration-200 oui-ease-in-out",
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
  const { currentTip, currentIndex, tips, prevTips, nextTips, closeTips } =
    props;

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
        className={cn("oui-w-full oui-items-start oui-justify-start")}
      >
        <div
          className={cn("oui-w-full", currentTip?.url && "oui-cursor-pointer")}
          onClick={() => {
            if (currentTip?.url) {
              window.open(currentTip.url, "_blank");
            }
          }}
        >
          <Text size="xs" className="oui-leading-5" intensity={80}>
            {currentTip?.i18n?.[i18n.language] || currentTip?.message}
          </Text>
        </div>
        <Flex width="100%" justify="between">
          <div>
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
        className="oui-size-4 oui-shrink-0 oui-cursor-pointer oui-text-base-contrast-54 hover:oui-text-base-contrast-80 lg:oui-size-5"
        onClick={prevTips}
      />
      <div className="oui-text-sm oui-text-base-contrast-54">
        {currentIndex + 1}/{tipsCount}
      </div>
      <ChevronRightIcon
        size={20}
        opacity={1}
        className="oui-size-4 oui-shrink-0 oui-cursor-pointer oui-text-base-contrast-54 hover:oui-text-base-contrast-80 lg:oui-size-5"
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
        "oui-text-2xs oui-font-medium oui-leading-[18px]",
        "oui-whitespace-nowrap oui-break-normal",
        className,
      )}
    >
      {label}
    </Flex>
  );
};
