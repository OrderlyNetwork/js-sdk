import { Box, ChevronLeftIcon, ChevronRightIcon, CloseIcon, cn, DialogTitle, DialogHeader, Dialog, DialogBody, DialogContent, Divider, Flex, useScreen } from "@orderly.network/ui";
import { InfoIcon } from "../icons";
import { AnnouncementTips, AnnouncementType, useAnnouncementTipsScript } from "./script";

export const AnnouncementTipsUI = (props: ReturnType<typeof useAnnouncementTipsScript>) => {
  const { showTips, closeTips, tips, currentIndex, nextTips, prevTips, maintenanceDialogInfo } = props;
  const { isMobile } = useScreen();
  if (maintenanceDialogInfo) {
    return (
      <Dialog open={true}>
        <DialogContent
          closable={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="oui-w-[320px] md:oui-w-auto"
        >
          <DialogHeader>
            <DialogTitle>System upgrade in progress</DialogTitle>
          </DialogHeader>
          <Divider />
          <DialogBody className='oui-text-2xs md:oui-text-xs'>{maintenanceDialogInfo}</DialogBody>
        </DialogContent>
      </Dialog>
    );
  }
  if (!showTips || !tips.length) {
    return <></>;
  }
  const currentTip = tips[currentIndex];
  return (
    <Flex
      className={cn(
        "oui-bg-base-6 md:oui-bg-line-6",
        "md:hover:oui-bg-line-12",
        "oui-text-2xs md:oui-text-sm",
        "oui-relative oui-gap-1",
        "oui-mx-1 md:oui-mx-0",
        "md:oui-w-full md:oui-mt-3  oui-pl-4 oui-py-3  oui-pr-0 md:oui-pr-[60px]",
        "oui-leading-4",
        "oui-rounded-xl md:oui-rounded-none",
        "oui-min-h-[48px]",
        "oui-justify-start oui-items-start",
        "xl:oui-justify-center xl:oui-items-center xl:oui-px-4"
      )}
    >
      {
        isMobile ?
          <MobileTips currentTip={currentTip} currentIndex={currentIndex} tips={tips} prevTips={prevTips} nextTips={nextTips} closeTips={closeTips} />
          :
          <DeskTopTips currentTip={currentTip} currentIndex={currentIndex} tips={tips} prevTips={prevTips} nextTips={nextTips} closeTips={closeTips} />
      }

    </Flex>
  );
};

const DeskTopTips = (props: { currentTip: AnnouncementTips, currentIndex: number, tips: AnnouncementTips[], prevTips: () => void, nextTips: () => void, closeTips: () => void }) => {
  const { currentTip, currentIndex, tips, prevTips, nextTips, closeTips } = props;
  return (
    <>
      <div className={cn(
        'oui-flex oui-items-start oui-justify-start oui-gap-1 oui-mx-[120px]',
        currentTip.url ? 'oui-cursor-pointer' : ''
      )}>
        <RenderTipsType type={currentTip.type} />
        <Box className="oui-font-semibold oui-leading-4 oui-ml-2 oui-text-base-contrast-80 oui-line-clamp-1 oui-overflow-hidden oui-text-ellipsis">{currentTip.content}</Box>

      </div>
      <div className={cn(
        'oui-flex oui-items-center oui-justify-center oui-gap-1',
        'oui-absolute oui-right-2 md:oui-right-4 oui-top-2/4 -oui-translate-y-2/4'
      )}>
        <SwitchTips currentIndex={currentIndex} tipsCount={tips.length} prevTips={prevTips} nextTips={nextTips} />
        <ClosePart closeTips={closeTips} />
      </div>
    </>
  )
}

const MobileTips = (props: { currentTip: AnnouncementTips, currentIndex: number, tips: AnnouncementTips[], prevTips: () => void, nextTips: () => void, closeTips: () => void }) => {
  const { currentTip, currentIndex, tips, prevTips, nextTips, closeTips } = props;
  return (
    <>
      <div className={cn(
        'oui-flex oui-flex-col oui-items-start oui-justify-start oui-gap-5 oui-w-full oui-mr-[60px] ',
        currentTip.url ? 'oui-cursor-pointer' : ''
      )}>
        <Box className="oui-font-semibold oui-leading-4 oui-ml-2 oui-text-base-contrast-80 oui-text-sm oui-line-clamp-2 oui-h-[36px] oui-overflow-hidden oui-text-ellipsis">{currentTip.content}</Box>

        <div className="oui-flex oui-items-center oui-justify-between oui-gap-1 oui-w-full">

          <RenderTipsType type={currentTip.type} />
          <SwitchTips currentIndex={currentIndex} tipsCount={tips.length} prevTips={prevTips} nextTips={nextTips} />
        </div>
      </div>

      <div className={cn(
        'oui-absolute oui-right-4 oui-top-3'
      )}>
        <ClosePart closeTips={closeTips} />
      </div>
    </>

  )
}

const SwitchTips = ({ currentIndex, tipsCount, prevTips, nextTips }: { currentIndex: number, tipsCount: number, prevTips: () => void, nextTips: () => void }) => {

  return (

    <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 oui-text-base-contrast-54">
      <ChevronLeftIcon size={20} opacity={1} className=" oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-flex-shrink-0 oui-w-4 md:oui-w-5 oui-h-4 md:oui-h-5 oui-cursor-pointer "
        onClick={prevTips}
      />
      <div className="oui-text-base-contrast-54 oui-text-xs">
        {currentIndex + 1}/{tipsCount}
      </div>
      <ChevronRightIcon size={20} opacity={1} className="oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-flex-shrink-0 oui-w-4 md:oui-w-5 oui-h-4 md:oui-h-5 oui-cursor-pointer "
        onClick={nextTips}
      />
    </div>

  )
}

const ClosePart = ({ closeTips }: { closeTips: () => void }) => {
  return (

    <CloseIcon
      size={16}
      opacity={1}
      className=" oui-ml-4 md:oui-ml-5 oui-w-5 oui-h-5 oui-text-base-contrast-80 md:oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-cursor-pointer"
      onClick={closeTips}
    />
  )
}


const RenderTipsType = ({ type }: { type?: AnnouncementType }) => {
  if (type === AnnouncementType.Listing) {
    return <div className={cn(
      "oui-flex oui-items-center oui-justify-center oui-px-2 oui-h-[18px] oui-rounded-sm ",
      "oui-bg-primary/15 oui-text-primary oui-text-2xs oui-font-medium"


    )}>Listing</div>;
  }
  if (type === AnnouncementType.Maintenance) {
    return <div className={cn(
      "oui-flex oui-items-center oui-justify-center oui-px-2 oui-h-[18px] oui-rounded-sm ",
      "oui-bg-[rgba(232,136,0,0.15)] oui-text-warning-darken oui-text-2xs oui-font-medium"


    )}>Maintenance</div>;
  }
  if (type === AnnouncementType.Delisting) {
    return <div className={cn(
      "oui-flex oui-items-center oui-justify-center oui-px-2 oui-h-[18px] oui-rounded-sm ",
      "oui-bg-[rgba(232,136,0,0.15)] oui-text-warning-darken oui-text-2xs oui-font-medium"


    )}>Delisting</div>;
  }
  return <div/>
};
