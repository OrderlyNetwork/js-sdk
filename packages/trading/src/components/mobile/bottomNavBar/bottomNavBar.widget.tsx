import { useBottomNavBarScript } from "./bottomNavBar.script";
import { BottomNavBar } from "./bottomNavBar.ui";

export const BottomNavBarWidget = () => {
    const state = useBottomNavBarScript();
    return (<BottomNavBar {...state} />);
};
