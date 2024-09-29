import { useNavBarScript } from "./navBar.script";
import { NavBar } from "./navBar.ui";

export const NavBarWidget = (props: {
    className?: string;
}) => {
    const state = useNavBarScript();
    return (<NavBar className={props.className} {...state} />);
};
