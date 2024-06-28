import { Flex } from "../../flex";
import { Paginations, PaginationProps } from "../../pagination";
import { useTable } from "./tableContext";

export const Pagination = (props: Omit<PaginationProps, "classNames">) => {
  const { meta } = useTable();

  if (!meta) {
    throw new Error(
      "The Pagination component should be used inside `DataTable` component"
    );
  }

  if (props.pageTotal === 0) return null;

  return (
    <Flex
      justify={"end"}
      py={2}
      mx={3}
      className="oui-h-10 oui-border-t oui-border-line"
    >
      <Paginations {...props} className="oui-table-pagination" />
    </Flex>
  );
};

Pagination.displayName = "TablePagination";
