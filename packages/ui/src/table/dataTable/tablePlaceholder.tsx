import { ReactNode } from "react";
import { ExtensionSlot } from "../../plugin/slot";
import { Box } from "../../box";
import { Spinner } from "../../spinner/spinner";
import { ExtensionPositionEnum } from "../../plugin";

export const TablePlaceholder = (
  props: React.HTMLAttributes<HTMLDivElement> & {
    visible?: boolean;
    loading?: boolean;
    emptyView?: ReactNode;
  }
) => {
  const { visible, loading, emptyView, ...divProps } = props;

  if (!visible) return null;

  return (
    <Box
      position="absolute"
      left={0}
      top={0}
      right={0}
      bottom={0}
      {...divProps}
      // style={{
      //   width: width || "100%",
      //   height: height || "100%",
      // }}
      className="oui-flex oui-justify-center oui-items-center oui-bg-base-9/75"
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
