import decamelize from "decamelize";

export const encodeName = (name: string) => {
  return decamelize(name, {
    preserveConsecutiveUppercase: false,
  })
    .replaceAll(".", "_")
    .replace("@", "__")
    .replace("/", "___");
};

export const decodeName = (name: string) => {
  return name.replace("___", "/").replace("__", "@").replaceAll("_", ".");
};
