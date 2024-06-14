/**
 * capitalize the first letter
 * @param str
 * @returns string
 */
export const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
