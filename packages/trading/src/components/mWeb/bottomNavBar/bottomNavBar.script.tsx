import { modal } from "@orderly.network/ui";
import { AccountSheetWidget } from "../accountSheet";

export const useBottomNavBarScript = () => {

    const onShowAccountSheet = () => {
        modal.sheet({
            title: "Account",
            leading: "Icon",
            content: (<AccountSheetWidget />)
        });
    };
    const onShowPortfolioSheet = () => {
        modal.sheet({
            title: "Account"
        });
    };
    return {
        onShowAccountSheet,
        onShowPortfolioSheet
    };
};

export type BottomNavBarState = ReturnType<typeof useBottomNavBarScript>;
