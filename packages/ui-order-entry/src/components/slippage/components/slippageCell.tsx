import { useRef } from "react";
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
import { SlippageEditor } from "./slippageEditor";

export const SlippageCell = (props: {
  slippage: string;
  setSlippage: (slippage: string) => void;
  estSlippage: number | null;
}) => {
  const { t } = useTranslation();
  const [open, { setTrue: setOpen, setFalse: setClose, toggle }] =
    useBoolean(false);

  const { isMobile } = useScreen();
  const slippageRef = useRef<{ getValue: () => number | undefined }>(null);

  const onConfirm = () => {
    const val = slippageRef.current?.getValue();

    props.setSlippage(!val ? "1" : val.toString());
    setClose();
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
            onClick: () => setClose(),
          },
        }}
      >
        <SlippageEditor
          ref={slippageRef}
          isMobile={isMobile}
          initialValue={props.slippage ? Number(props.slippage) : undefined}
        />
      </SimpleDialog>
      <Flex justify={"between"}>
        <Text size="2xs">{t("orderEntry.slippage")}</Text>
        <AuthGuard
          fallback={() => (
            <Text size="2xs">
              {t("orderEntry.slippage.est")}: -% / {t("common.max")}: --%
            </Text>
          )}
        >
          <Flex gap={1}>
            <Text.numeral
              size="2xs"
              rule="percentages"
              prefix={`${t("orderEntry.slippage.est")}: `}
              suffix={` / ${t("common.max")}: `}
            >
              {props.estSlippage ?? 0}
            </Text.numeral>
            <button className="oui-text-2xs" onClick={() => setOpen()}>
              <Flex className="oui-gap-0.5" as="span">
                <Text size="2xs" className="oui-text-primary">
                  {`${props.slippage || "-"}%`}
                </Text>
                <EditIcon
                  className="oui-text-primary oui-hidden md:oui-block"
                  size={12}
                  opacity={1}
                />
              </Flex>
            </button>
          </Flex>
        </AuthGuard>
      </Flex>
    </>
  );
};
