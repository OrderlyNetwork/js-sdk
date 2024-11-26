import { FC, ReactNode } from "react";
import { Box } from "../box";
import { Spinner } from "../spinner/spinner";
import { ExtensionPositionEnum, ExtensionSlot } from "../plugin";

type TablePlaceholderProps = {
  visible?: boolean;
  loading?: boolean;
  emptyView?: ReactNode;
};

export const TablePlaceholder: FC<TablePlaceholderProps> = (props) => {
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
        emptyView || (
          <ExtensionSlot position={ExtensionPositionEnum.EmptyDataIdentifier} />
        )
      )}
    </Box>
  );
};
