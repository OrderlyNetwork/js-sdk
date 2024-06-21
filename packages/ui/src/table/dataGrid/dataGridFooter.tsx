import { Box } from "../../box";
import { Flex } from "../../flex";
import { Paginations } from "../../pagination";
import { useDataGridContext } from "./dataGridContext";

export const DataGridFooter = (props) => {
  const { pagination } = useDataGridContext();
  return (
    <Flex justify={"end"}>
      {pagination && pagination.count > 0 && (
        <div>
          <Paginations {...pagination} />
        </div>
      )}
    </Flex>
  );
};
