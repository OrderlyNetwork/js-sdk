
declare global {
    interface Window {
        __ORDERLY_VERSION__?: {
            [key: string]: string;
        };
    }
}
if(typeof window !== 'undefined') {
    window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
    window.__ORDERLY_VERSION__["@orderly.network/ui-tradingview"] = "2.1.0-i18n-cli.19";
};

export default "2.1.0-i18n-cli.19";
