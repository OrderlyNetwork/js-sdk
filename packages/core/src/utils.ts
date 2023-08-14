export const base64url = function (aStr: string): string {
    return aStr.replace(/\+/g, '-').replace(/\//g, '_');
};
