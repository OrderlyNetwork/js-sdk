export type ApiManagerScriptReturns = {
    address?: string;
    uid?: number;
    onCreateApiKey?: () => void;
    onReadApiGuide?: () => void;
};

export const useApiManagerScript = (): ApiManagerScriptReturns => {

    const onCreateApiKey = () => {};
    const onReadApiGuide = () => {};
    return {
        address: "0xe8f299b9555c6de49fd9b06637cd89781901111f",
        uid: 106732112,
        onCreateApiKey,
        onReadApiGuide
    };
};