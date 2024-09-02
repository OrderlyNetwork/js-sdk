import { useSharePnLScript } from "./sharePnL.script";
import { SharePnL } from "./sharePnL.ui";

export const SharePnLWidget = () => {
    const state = useSharePnLScript();
    return (<SharePnL {...state} />);
};
