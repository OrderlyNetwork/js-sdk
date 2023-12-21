export const setStorage = (key: string, value: any) => {
  let data: any = sessionStorage.getItem(key);
  if (data) {
    data = JSON.parse(data);
  } else {
    data = {};
  }

  data = { ...data, ...value };

  sessionStorage.setItem(key, JSON.stringify(data));
};

export const getStorage = (key: string) => {
  let data: any = sessionStorage.getItem(key);
  if (data) {
    data = JSON.parse(data);
  } else {
    data = {};
  }

  return data;
};

export const removeStorage = (key: string) => {
  sessionStorage.removeItem(key);
};
