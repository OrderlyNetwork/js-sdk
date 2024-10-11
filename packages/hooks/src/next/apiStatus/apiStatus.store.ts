import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type ApiStatus = {
  loading: boolean;
  error?: string;
};

type ApiStatusState = {
  apis: {
    [Key: string]: ApiStatus;
  };
};

type ApiStatusActions = {
  updateStatus: (key: string, status: ApiStatus) => void;
  updateApiLoading: (key: string, loading: boolean) => void;
  updateApiError: (key: string, error: string) => void;
};

export const useApiStatusStore = create<
  ApiStatusState & {
    actions: ApiStatusActions;
  }
>()(
  immer((set) => ({
    apis: {},
    actions: {
      updateStatus: (key, status) => {
        set((state) => {
          state.apis[key] = status;
        });
      },
      updateApiLoading: (key, loading) => {
        set((state) => {
          state.apis[key].loading = loading;
        });
      },
      updateApiError: (key, error) => {
        set((state) => {
          state.apis[key] = {
            loading: false,
            error,
          };
        });
      },
    },
  }))
);

export const useApiStatusActions = () =>
  useApiStatusStore((state) => state.actions);
