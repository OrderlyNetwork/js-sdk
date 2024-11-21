import { useAccountScript } from "./account.script";
import { Account } from "./account.ui";

export const AccountWidget = () => {
    const state = useAccountScript();
    return (<Account {...state} />);
};
