export const firstLetterToUpperCase = (str: string) => {
  // implementation

  const arr = str.replace("_", " ").split(" ");

  //loop through each element of the array and capitalize the first letter.

  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase();
  }

  return arr.join("");
};


export function capitalizeString(str: string): string {
  // 将字符串全部转换为小写
  const lowercaseStr: string = str.toLowerCase();
  // 将第一个字符转换为大写
  const capitalizedStr: string = lowercaseStr.charAt(0).toUpperCase() + lowercaseStr.slice(1);
  return capitalizedStr;
}