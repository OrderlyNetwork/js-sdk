import { useRef } from "react";
import { useBoolean } from "@orderly.network/hooks";
import { EditIcon, Flex, Text, SimpleDialog } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { SlippageEditor } from "./slippageEditor";

export const SlippageCell = (props: {
  slippage: string;
  setSlippage: (slippage: string) => void;
  estSlippage: number | null;
}) => {
  // const { t } = useTranslation();
  const [open, { setTrue: setOpen, setFalse: setClose, toggle }] =
    useBoolean(false);

  // const [slippage, setSlippage] = useLocalStorage("orderly-slippage", "");
  const slippageRef = useRef<{ getValue: () => number | undefined }>(null);

  const onConfirm = () => {
    const val = slippageRef.current?.getValue();
    console.log("val", val);

    props.setSlippage(val?.toString() ?? "");
    setClose();
    return Promise.resolve(true);
  };

  return (
    <>
      <SimpleDialog
        open={open}
        onOpenChange={toggle}
        title={"Settings"}
        contentProps={{ size: "sm" }}
        actions={{
          primary: { disabled: false, label: "Save", onClick: onConfirm },
          secondary: {
            label: "Cancel",
            onClick: () => setClose(),
          },
        }}
      >
        <SlippageEditor
          ref={slippageRef}
          initialValue={props.slippage ? Number(props.slippage) : undefined}
        />
      </SimpleDialog>
      <Flex justify={"between"}>
        <Text size="2xs">Slippage</Text>
        <AuthGuard fallback={() => <Text size="2xs">Est: -% / Max: --%</Text>}>
          <Flex gap={1}>
            <Text.numeral
              size="2xs"
              rule="percentages"
              prefix={`Est:`}
              suffix={` / Max: `}
            >
              {props.estSlippage ?? 0}
            </Text.numeral>
            <Text size="2xs" className="oui-text-base-contrast-80">
              {`${props.slippage || "-"}%`}
            </Text>
            <button className="oui-text-2xs" onClick={() => setOpen()}>
              <EditIcon className="oui-text-base-contrast-54" size={12} />
            </button>
          </Flex>
        </AuthGuard>
      </Flex>
    </>
  );
};
