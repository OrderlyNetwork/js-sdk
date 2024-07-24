import {
  Box,
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

export const MaintenanceTipsUI = (props: MaintenanceTipInterface) => {
  const { showTips, showDialog, tipsContent, closeTips, dialogContent } = props;
  if (showDialog) {
    return (
      <Dialog open={true}>
        <DialogContent closable={false}>
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
      height={48}
      justify={"center"}
      className="oui-w-full oui-bg-warning/10 oui-text-warning oui-text-sm oui-relative oui-gap-1"
    >
      <InfoIcon size={20} className="oui-flex-shrink-0 oui-w-5 oui-h-5 " />
      <Box className="oui-font-semibold ">{tipsContent}</Box>
      <CloseIcon
        size={16}
        className="oui-absolute oui-right-4 oui-text-secondary/[0.36] hover:oui-text-secondary/80 oui-cursor-pointer"
        onClick={closeTips}
      />
    </Flex>
  );
};
