import { API } from "@orderly.network/types";
import { Button } from "@orderly.network/ui";

export const TP_SLEditButton = (props: { order: API.Order }) => {
  return (
    <>
      <Button size="sm" variant={"outlined"} color={"secondary"}>
        Edit
      </Button>
      {/* <TPSLEditorWidget position={props.order} /> */}
    </>
  );
};
