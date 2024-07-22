import { useCardScript } from "./card.script";
import { CardUI } from "./card.ui";

export const CardWidget = () => {
    const state = useCardScript();
    return (
        <CardUI {...state}/>
    );
};
