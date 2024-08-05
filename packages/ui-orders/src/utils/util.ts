export const upperCaseFirstLetter = (str: string) => {
    if (str === undefined) return str;
    if (str.length === 0) return str;
    if (str.length === 1) return str.charAt(0).toUpperCase();
    return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
  };