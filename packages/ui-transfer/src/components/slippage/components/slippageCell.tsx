import React, { useRef } from "react";
import { useBoolean } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  EditIcon,
  Flex,
  Text,
  SimpleDialog,
  useScreen,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import type { SlippageProps } from "../slippage.ui";
import { SlippageEditor } from "./slippageEditor";

export const SlippageCell: React.FC<SlippageProps> = (props) => {
  const { t } = useTranslation();

  const [open, { setTrue, setFalse, toggle }] = useBoolean(false);

  const { isMobile } = useScreen();

  const slippageRef = useRef<{ getValue: () => number | undefined }>(null);

  const onConfirm = () => {
    const val = slippageRef.current?.getValue();
    props.setSlippage?.(val?.toString() ?? "");
    setFalse();
    return Promise.resolve(true);
  };

  return (
    <>
      <SimpleDialog
        open={open}
        onOpenChange={toggle}
        title={t("common.settings")}
        contentProps={{ size: isMobile ? "xs" : "sm" }}
        actions={{
          primary: {
            disabled: false,
            label: t("common.save"),
            onClick: onConfirm,
          },
          secondary: {
            label: t("common.cancel"),
            onClick: setFalse,
          },
        }}
      >
        <SlippageEditor
          ref={slippageRef}
          isMobile={isMobile}
          initialValue={props.slippage ? Number(props.slippage) : undefined}
        />
      </SimpleDialog>
      <Flex width={"100%"} itemAlign="center" justify={"between"}>
        <Text intensity={36} size="2xs">
          {t("orderEntry.slippage")}
        </Text>
        <AuthGuard fallback={() => <Text size="2xs">-%</Text>}>
          <Flex itemAlign={"center"} justify={"end"} gap={1}>
            <Text size="2xs" className="oui-text-primary">
              {props.slippage || "-"}%
            </Text>
            <button className="oui-text-2xs" onClick={setTrue}>
              <EditIcon
                size={12}
                opacity={1}
                className="oui-text-2xs oui-text-primary"
              />
            </button>
          </Flex>
        </AuthGuard>
      </Flex>
    </>
  );
};
