import { ToastOptions } from "react-hot-toast";

export type Theme = {
  rounded: {};

  components: {
    toast: {} & ToastOptions;
  };
};
