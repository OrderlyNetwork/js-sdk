import { posterLayoutConfig } from "@orderly.network/hooks/src/services/painter/basePaint";

export interface ShareConfigProps {
    pnl: {
        /**
         * defualt is Manrope
         */
        fontFamily?: string,
        /**
         * can not empty
         */
        backgroundImages: string[],
        /**
         * posterLayoutConfig
         */
        layout?: posterLayoutConfig,
    },
}