
declare global {
    interface Window {
        __ORDERLY_VERSION__?: {
            [key: string]: string;
        };
    }
}
if(typeof window !== 'undefined') {
    window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
    window.__ORDERLY_VERSION__["@orderly.network/utils"] = "2.0.2-internal-20250109.2";
};

export default "2.0.2-internal-20250109.2";
