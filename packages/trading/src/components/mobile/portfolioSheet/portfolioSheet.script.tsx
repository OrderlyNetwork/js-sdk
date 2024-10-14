import { useTradingLocalStorage } from "../../../provider/useTradingLocalStorage";

export const usePortfolioSheetScript = () => {

    const assets = useAssets();
    return {
        ...assets,
    };
};


const useAssets = () => {
    const { hideAssets, setHideAssets } = useTradingLocalStorage();
    const toggleHideAssets = () => {
        setHideAssets(!hideAssets);
    };
    return {
        hideAssets,
        toggleHideAssets,
    }
};

export type PortfolioSheetState = ReturnType<typeof usePortfolioSheetScript>;
