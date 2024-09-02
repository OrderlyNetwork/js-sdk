import {ElementType} from "react";
import {useModal, modal} from "../modal";
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "./sheet";
import {SheetProps} from "../modal/preset/sheet";
import {cnBase} from "tailwind-variants";


function createSheetComponent<P extends Partial<SheetProps>>(
    Comp: ElementType
) {
    return modal.create((props: P) => {
        const {visible, hide, resolve, reject, onOpenChange} = useModal();
        // @ts-ignore
        const {title, ...rest} = props;
        return (
            <Sheet open={visible} onOpenChange={onOpenChange}>
                <SheetContent
                    className={props.classNames?.content}
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                    }}
                >
                    <SheetHeader>
                        <SheetTitle>{title}</SheetTitle>
                    </SheetHeader>
                    <div className={cnBase('oui-pt-4', props.classNames?.body)}>
                        <Comp {...rest} close={hide}
                              resolve={resolve}
                              reject={reject}/>
                    </div>
                </SheetContent>
            </Sheet>
        );
    });
}


export const registerSimpleSheet = <Props = {}>(
    id: string,
    comp: ElementType<Props>,
    props?:Omit<SheetProps, 'content'>
) => {
    // @ts-ignore
    modal.register(id, createSheetComponent(comp), props);
};
