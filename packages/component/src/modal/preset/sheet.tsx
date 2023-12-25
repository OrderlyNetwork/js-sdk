import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/sheet";
import { modalActions } from "../modalContext";
import { create } from "../modalHelper";
import { useModal } from "../useModal";

export interface SheetProps {
  title: string;
  content?: React.ReactNode;
  contentClassName?: string;
}

const SimpleSheet = create<SheetProps>((props) => {
  const { visible, hide, resolve, onOpenChange } = useModal();
  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent
        className={props.contentClassName}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <SheetHeader>
          <SheetTitle>{props.title}</SheetTitle>
        </SheetHeader>
        {props.content}
      </SheetContent>
    </Sheet>
  );
});

export const sheet = (props: SheetProps) => {
  return modalActions.show(SimpleSheet, props);
};
