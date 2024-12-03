
declare global {
    interface Window {
        __ORDERLY_VERSION__?: {
            [key: string]: string;
        };
    }
}
if(typeof window !== 'undefined') {
    window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
    window.__ORDERLY_VERSION__["@orderly.network/types"] = "2.0.1-migrationStoreState.3";
};

export default "2.0.1-migrationStoreState.3";
