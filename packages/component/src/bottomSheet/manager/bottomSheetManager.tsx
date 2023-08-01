interface BottomSheetManager {
  open: () => void;
  push: (sheet: React.ReactNode) => Promise<void>;
  pop: () => void;
}
