import { useFooterScript } from "./footer.script";
import { FooterUI } from "./footer.ui";

export const FooterWidget = () => {
    const state = useFooterScript();
    return (
        <FooterUI {...state}/>
    );
};
