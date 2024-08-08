import { ReactNode } from "react";
import { ExtensionSlot } from "../../plugin/slot";
import { Box } from "../../box";
import { Spinner } from "../../spinner/spinner";

export const TablePlaceholder = (props: {
  visible?: boolean;
  loading?: boolean;
  emptyView?: ReactNode;
}) => {
  const { visible, loading, emptyView } = props;

  if (!visible) return null;

  return (
    <Box
      position="absolute"
      left={0}
      top={0}
      right={0}
      bottom={0}
      className="oui-flex oui-justify-center oui-items-center"
    >
      {loading ? (
        <Spinner />
      ) : (
        emptyView || <ExtensionSlot position={"emptyDataState"} />
      )}
    </Box>
  );
};
