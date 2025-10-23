import React, { useCallback, useMemo } from "react";
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
  useEmblaCarousel,
} from "@orderly.network/ui";
import { CloseIcon } from "../icons";
import type { AnnouncementScriptReturn } from "./announcement.script";
import {
  useMarqueeOnce,
  usePrevNextButtons,
  useSelectedSnapDisplay,
} from "./hooks";
import { SoundIcon } from "./icons";

interface SwitchTipsProps {
  selectedSnap: number;
  snapCount: number;
  prevDisabled: boolean;
  nextDisabled: boolean;
  nextTips: React.MouseEventHandler<SVGSVGElement>;
  prevTips: React.MouseEventHandler<SVGSVGElement>;
}

const SwitchTips: React.FC<Readonly<SwitchTipsProps>> = (props) => {
  const {
    selectedSnap,
    snapCount,
    prevDisabled,
    nextDisabled,
    prevTips,
    nextTips,
  } = props;
  const { isMobile } = useScreen();
  if (isMobile) {
    return (
      <div
        aria-live="polite"
        className="oui-text-sm oui-tabular-nums oui-text-base-contrast-54"
      >
        {selectedSnap + 1}/{snapCount}
      </div>
    );
  }
  return (
    <div className="oui-flex oui-items-center oui-justify-center oui-gap-0 oui-text-base-contrast-54">
      <ChevronLeftIcon
        size={16}
        opacity={1}
        className={cn(
          "oui-size-4 oui-shrink-0 oui-text-base-contrast-54 hover:oui-text-base-contrast-80 lg:oui-size-5",
          prevDisabled ? "oui-cursor-not-allowed" : "oui-cursor-pointer",
        )}
        onClick={prevDisabled ? undefined : prevTips}
      />
      <div
        aria-live="polite"
        className="oui-text-sm oui-tabular-nums oui-text-base-contrast-54"
      >
        {selectedSnap + 1}/{snapCount}
      </div>
      <ChevronRightIcon
        size={16}
        opacity={1}
        className={cn(
          "oui-size-4 oui-shrink-0 oui-text-base-contrast-54 hover:oui-text-base-contrast-80 lg:oui-size-5",
          nextDisabled ? "oui-cursor-not-allowed" : "oui-cursor-pointer",
        )}
        onClick={nextDisabled ? undefined : nextTips}
      />
    </div>
  );
};

interface ControlsProps {
  selectedSnap: number;
  snapCount: number;
  prevDisabled: boolean;
  nextDisabled: boolean;
  nextTips: React.MouseEventHandler<SVGSVGElement>;
  prevTips: React.MouseEventHandler<SVGSVGElement>;
  closeTips: React.MouseEventHandler<SVGSVGElement>;
}

const Controls: React.FC<ControlsProps> = (props) => {
  const {
    selectedSnap,
    snapCount,
    prevDisabled,
    nextDisabled,
    prevTips,
    nextTips,
    closeTips,
  } = props;
  const { isMobile } = useScreen();
  return (
    <Flex gap={isMobile ? 1 : 2} justify={"center"} itemAlign={"center"}>
      <SwitchTips
        prevDisabled={prevDisabled}
        nextDisabled={nextDisabled}
        selectedSnap={selectedSnap}
        snapCount={snapCount}
        prevTips={prevTips}
        nextTips={nextTips}
      />
      <CloseIcon
        size={18}
        onClick={closeTips}
        className="oui-cursor-pointer oui-text-base-contrast-80 hover:oui-text-base-contrast"
      />
    </Flex>
  );
};

const TipsType: React.FC<{ type?: AnnouncementType | null }> = (props) => {
  const { type } = props;

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
        [AnnouncementType.Campaign]: {
          label: "Latest Campaign is coming",
          className: "oui-bg-primary/15 oui-text-primary",
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

interface ItemProps {
  type?: AnnouncementType | null;
  text: string;
  url?: string | null;
  isActive: boolean;
  onItemFinish: () => void;
}

const AnnouncementItem: React.FC<ItemProps> = (props) => {
  const { type, text, url, isActive, onItemFinish } = props;

  const { containerRef, contentRef, overflow } = useMarqueeOnce({
    isActive: isActive,
    pxPerSec: 90,
    startDelayMs: 1000,
    endDelayMs: 1000,
    fallbackStayMs: 2500,
    onFinish: onItemFinish,
  });

  const onClick = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Flex
      height={"100%"}
      itemAlign="center"
      className="oui-flex-none oui-basis-full oui-transform-gpu"
    >
      <div
        ref={containerRef}
        className={cn(
          "oui-relative oui-flex oui-h-[34px] oui-w-full oui-transform-gpu oui-items-center oui-overflow-hidden",
          overflow ? "oui-justify-start" : "oui-justify-center",
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            "oui-inline-flex oui-items-center oui-gap-2",
            "oui-h-[34px] oui-whitespace-nowrap oui-leading-[34px]",
            "oui-w-fit oui-transform-gpu oui-will-change-transform",
          )}
        >
          <TipsType type={type} />
          <Text
            size="xs"
            intensity={80}
            className={cn(
              "oui-transform-gpu",
              url ? "oui-cursor-pointer" : undefined,
            )}
            onClick={url ? onClick : undefined}
          >
            {text}
          </Text>
        </div>
      </div>
    </Flex>
  );
};

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
    closeTips,
    className,
    style,
  } = props;

  const { t, i18n } = useTranslation();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    axis: "y",
    align: "center",
    duration: 30,
  });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const { selectedSnap, snapCount } = useSelectedSnapDisplay(emblaApi);

  const goNext = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    emblaApi.scrollNext();
  }, [emblaApi]);

  if (maintenanceDialogInfo) {
    return (
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
    );
  }

  if (!showAnnouncement) {
    return null;
  }

  const renderSlider = () => {
    // if tips length is 1, loop is not effective, so we need to duplicate the tips
    const list = tips.length === 1 ? [...tips, ...tips] : tips;

    return list.map((item, index) => (
      <AnnouncementItem
        key={`item-${item.announcement_id}-${index}`}
        type={item?.type}
        text={item?.i18n?.[i18n.language] || item?.message?.trim()}
        url={item?.url}
        isActive={index === selectedSnap}
        onItemFinish={goNext}
      />
    ));
  };

  return (
    <div
      style={style}
      className={cn(
        "oui-relative oui-z-[1] oui-flex oui-transform-gpu oui-flex-row oui-flex-nowrap oui-items-center oui-justify-between oui-gap-x-1.5 oui-overflow-hidden oui-rounded-xl oui-bg-base-9 oui-px-4 oui-font-semibold",
        className,
      )}
    >
      <div className="oui-size-[18px]">
        <SoundIcon />
      </div>
      <div
        ref={emblaRef}
        className="oui-relative oui-h-[34px] oui-w-full oui-max-w-full oui-transform-gpu oui-overflow-hidden"
      >
        <div className="oui-flex oui-h-full oui-transform-gpu oui-flex-col">
          {renderSlider()}
        </div>
      </div>
      <Controls
        selectedSnap={tips.length === 1 ? 0 : selectedSnap}
        snapCount={tips.length === 1 ? 1 : snapCount}
        closeTips={closeTips}
        prevTips={onPrevButtonClick}
        nextTips={onNextButtonClick}
        prevDisabled={prevBtnDisabled}
        nextDisabled={nextBtnDisabled}
      />
    </div>
  );
};
