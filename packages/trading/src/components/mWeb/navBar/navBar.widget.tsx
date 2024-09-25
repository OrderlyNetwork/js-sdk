import { useNavBarScript } from "./navBar.script";
import { NavBar } from "./navBar.ui";

export const NavBarWidget = () => {
    const state = useNavBarScript();
    return (<NavBar {...state} />);
};
