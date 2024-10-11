import { useAccountSheetScript } from "./accountSheet.script";
import { AccountSheet } from "./accountSheet.ui";

export const AccountSheetWidget = () => {
    const state = useAccountSheetScript();
    return (<AccountSheet {...state} />);
};
