import { ReactNode } from "react";
import { Box } from "../box";
import { Spinner } from "../spinner/spinner";
import { EmptyDataState } from "./emptyDataState";

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
      className="oui-flex oui-justify-center oui-items-center"
    >
      {loading ? <Spinner /> : emptyView || <EmptyDataState />}
    </Box>
  );
};
