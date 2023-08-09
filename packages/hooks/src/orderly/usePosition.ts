export interface PositionReturn {
  data: any[];
  loading: boolean;
  close: (qty: number) => void;
}

// [data,{loading,close}]
export const usePosition = () => {
  return {};
};
