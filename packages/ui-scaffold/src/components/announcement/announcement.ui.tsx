import React, { useCallback, useMemo } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
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
import type { AnnouncementScriptReturn } from "./announcement.script";
import { SoundIcon } from "./icons";
import {
  usePrevNextButtons,
  useSelectedSnapDisplay,
} from "./usePrevNextButtons";

const Controls: React.FC<{
  selectedSnap: number;
  snapCount: number;
  prevDisabled: boolean;
  nextDisabled: boolean;
  prevTips: () => void;
  nextTips: () => void;
  closeTips: () => void;
}> = (props) => {
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
    contentRef,
    // mutiLine,
    className,
  } = props;

  const { t, i18n } = useTranslation();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      axis: "y",
    },
    [Autoplay({ delay: 2000, stopOnFocusIn: true, stopOnMouseEnter: true })],
  );

  const onNavButtonClick = useCallback((emblaApi?: EmblaCarouselType) => {
    const { autoplay } = emblaApi?.plugins() ?? {};
    if (!autoplay) {
      return;
    }
    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop;
    resetOrStop();
  }, []);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi, onNavButtonClick);

  const { selectedSnap, snapCount } = useSelectedSnapDisplay(emblaApi);

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
    <div
      className={cn(
        "oui-relative oui-z-[1] oui-mt-2 oui-flex oui-transform-gpu oui-flex-row oui-flex-nowrap oui-items-center oui-justify-between oui-overflow-hidden oui-rounded-xl oui-bg-base-9 oui-px-4 oui-font-semibold",
        className,
      )}
    >
      <div className="oui-size-[18px]">
        <SoundIcon />
      </div>
      <div
        ref={emblaRef}
        className={cn(
          "oui-relative oui-h-[34px] oui-transform-gpu oui-overflow-hidden oui-rounded-xl",
        )}
      >
        <div className="oui-flex oui-h-full oui-transform-gpu oui-flex-col">
          {tips.map((item, index) => (
            <Flex
              gap={2}
              height={"100%"}
              justify="center"
              itemAlign="center"
              className="oui-flex-none oui-basis-full oui-transform-gpu"
              key={`item-${item.announcement_id ?? index}`}
            >
              <RenderTipsType type={item?.type} />
              <Text
                size="xs"
                intensity={80}
                ref={contentRef}
                className="oui-h-[34px] oui-transform-gpu oui-leading-[34px]"
              >
                {item?.i18n?.[i18n.language] || item?.message?.trim()}
              </Text>
            </Flex>
          ))}
        </div>
      </div>
      <Controls
        selectedSnap={selectedSnap}
        snapCount={snapCount}
        closeTips={closeTips}
        prevTips={onPrevButtonClick}
        nextTips={onNextButtonClick}
        prevDisabled={prevBtnDisabled}
        nextDisabled={nextBtnDisabled}
      />
    </div>
  );
};

type SwitchTipsProps = {
  selectedSnap: number;
  snapCount: number;
  prevDisabled: boolean;
  nextDisabled: boolean;
  nextTips: () => void;
  prevTips: () => void;
};

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
  const display = (
    <div className="oui-text-sm oui-text-base-contrast-54">
      {selectedSnap + 1}/{snapCount}
    </div>
  );
  if (isMobile) {
    return display;
  }
  return (
    <div className="oui-flex oui-items-center oui-justify-center oui-gap-0 oui-text-base-contrast-54">
      <ChevronLeftIcon
        size={16}
        opacity={1}
        className={cn(
          "oui-size-4 oui-shrink-0 oui-text-base-contrast-54 hover:oui-text-base-contrast-80 lg:oui-size-5",
          isMobile || prevDisabled
            ? "oui-cursor-not-allowed"
            : "oui-cursor-pointer",
        )}
        onClick={isMobile || prevDisabled ? undefined : prevTips}
      />
      <div className="oui-text-sm oui-text-base-contrast-54">{display}</div>
      <ChevronRightIcon
        size={16}
        opacity={1}
        className={cn(
          "oui-size-4 oui-shrink-0 oui-text-base-contrast-54 hover:oui-text-base-contrast-80 lg:oui-size-5",
          isMobile || nextDisabled
            ? "oui-cursor-not-allowed"
            : "oui-cursor-pointer",
        )}
        onClick={isMobile || nextDisabled ? undefined : nextTips}
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
