import { useState } from "react";

export enum BottomTabType {
    position = 'Position',
    pending = 'Pending',
    tp_sl = 'TP/SL',
    history = 'History'
}

export const useBottomTabScript = () => {
    const [tab, setTab] = useState<BottomTabType>(BottomTabType.position);

    return {
        tab,
        setTab,
    };
};

export type BottomTabState = ReturnType<typeof useBottomTabScript>;
