
export function capitalizeString(str: string): string {
    // 将字符串全部转换为小写
    const lowercaseStr: string = str.toLowerCase();
    // 将第一个字符转换为大写
    const capitalizedStr: string = lowercaseStr.charAt(0).toUpperCase() + lowercaseStr.slice(1);
    return capitalizedStr;
}

/// "PERP_ETH_USDC" => "ETH_PERP"
export function transSymbolformString(input: string): string {
    const parts = input.split('_');
    if (parts.length !== 3) {
        throw new Error('Invalid string format');
    }

    const [first, second, third] = parts;

    if (!first.startsWith('PERP')) {
        throw new Error('Invalid string format');
    }

    const result = `${second}-${first}`;
    return result;
}