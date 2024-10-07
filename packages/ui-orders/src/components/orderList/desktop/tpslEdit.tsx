import { Button } from "@orderly.network/ui";
import { TPSLEditorWidget } from "@orderly.network/ui-positions";

export const TP_SLEdit = (props: { order: any }) => {
  return (
    <>
      <Button size="sm" variant={"outlined"} color={"secondary"}>
        Edit
      </Button>
      <TPSLEditorWidget position={props.order} />
    </>
  );
};
