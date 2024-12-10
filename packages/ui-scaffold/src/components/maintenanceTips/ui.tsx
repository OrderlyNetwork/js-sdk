import {
  Box,
  cn,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Divider,
  Flex,
} from "@orderly.network/ui";
import { CloseIcon, InfoIcon } from "../icons";
import { MaintenanceTipInterface } from "./script";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";

export const MaintenanceTipsUI = (props: MaintenanceTipInterface) => {
  const { showTips, showDialog, tipsContent, closeTips, dialogContent } = props;
  if (showDialog) {
    return (
      <Dialog open={true}>
        <DialogContent
          closable={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>System upgrade in progress</DialogTitle>
          </DialogHeader>
          <Divider />
          <DialogBody>{dialogContent}</DialogBody>
        </DialogContent>
      </Dialog>
    );
  }
  if (!showTips) {
    return <></>;
  }
  return (
    <Flex
      className={cn(
        "oui-bg-warning-darken/10 oui-text-warning-darken oui-text-2xs md:oui-text-sm oui-relative oui-gap-1",
        "oui-mx-1 md:oui-mx-0 md:oui-w-full  oui-pl-4 oui-pr-[60px] oui-py-2 md:oui-py-3",
        "oui-leading-4",
        "oui-rounded-xl md:oui-rounded-none",
        "oui-min-h-[48px]",
        "oui-justify-start oui-items-start",
        "xl:oui-justify-center xl:oui-items-center xl:oui-px-4"
      )}
    >
      <div className='oui-flex oui-items-start oui-justify-start oui-gap-1 '>
        <InfoIcon size={20} className="oui-flex-shrink-0 oui-w-4 md:oui-w-5 oui-h-4 md:oui-h-5 " />
        <Box className="oui-font-semibold oui-leading-4">{tipsContent}</Box>
      </div>
      <CloseIcon
        size={16}
        className="oui-absolute oui-right-4 oui-text-secondary/[0.36] hover:oui-text-secondary/80 oui-cursor-pointer -oui-translate-y-2/4 oui-top-2/4"
        onClick={closeTips}
      />
    </Flex>
  );
};
