import { PosterLayoutConfig } from "@orderly.network/hooks";

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
        layout?: PosterLayoutConfig,
        // normal text color
        /**
         * norma text color, default is  "rgba(255, 255, 255, 0.98)"
         */
        color?: string,
        /**
         * profit text color, default is "rgb(0,181,159)"
         */
        profitColor?: string,
        /**
         * loss text color, default is  "rgb(255,103,194)"
         */
        lossColor?: string,
        /**
         * brand color, default is "rgb(0,181,159)"
         */
        brandColor?: string,
    };
}


export const PnLDefaultProps = {
    fontFamily: "Manrope",
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgb(0,181,159)",
    lossColor: "rgb(255,103,194)",
    brandColor: "rgb(0,181,159)",
}