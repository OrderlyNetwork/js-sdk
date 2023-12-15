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
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
};
