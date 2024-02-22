export const firstLetterToUpperCase = (str: string) => {
  // implementation

  const arr = str.replace("_", " ").split(" ");

  //loop through each element of the array and capitalize the first letter.

  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase();
  }

  return arr.join("");
};

export const upperCaseFirstLetter = (str: string) => {
  if (str === undefined) return str;
  if (str.length === 0) return str;
  if (str.length === 1) return str.charAt(0).toUpperCase();
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
};

export const findLongestCommonSubString = (str1: string, str2: string) => {
  // let index = 0;

  for (let index = 0; index < str1.length; index++) {
    const ele1 = str1.at(index);
    const ele2 = str2.at(index);
    if (ele1 === ele2) {
      continue;
    }

    return index;
  }

  return -1;
};
