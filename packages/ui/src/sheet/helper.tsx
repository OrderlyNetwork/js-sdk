import { ElementType } from "react";
import { useModal, modal } from "../modal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";
import { SheetProps } from "../modal/preset/sheet";


function createSheetComponent<P extends Partial<SheetProps>>(
  Comp: ElementType
) {
  return modal.create((props: P) => {
    const { visible, hide, resolve, reject, onOpenChange } = useModal();
    // @ts-ignore
    const { title, ...rest } = props;
    return (
        <Sheet open={visible} onOpenChange={onOpenChange}>
        <SheetContent
          className={props.contentClassName}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <Comp {...rest} close={hide} resolve={resolve} reject={reject} />
        </SheetContent>
      </Sheet>
    );
  });
}

// export function registerDialog<Props = {}>() {}

export const registerSimpleSheet = <Props = {}>(
  id: string,
  comp: ElementType<Props>,
  props?: {title?:string}
) => {
  // @ts-ignore
  modal.register(id, createSheetComponent(comp), props);
};
