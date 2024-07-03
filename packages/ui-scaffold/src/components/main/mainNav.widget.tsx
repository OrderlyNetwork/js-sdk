import { MainNav } from "./mainNav.ui"
import {useMainNavBuilder} from "./useWidgetBuilder.script";

export const MainNavWidget = ()=>{
    const state = useMainNavBuilder();
    return <MainNav {...state}/>
}
