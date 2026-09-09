import { createContext, useContext } from "react";

interface LayoutLoadingContextValue {
  isGlobalLoading: boolean;
  setGlobalLoading: (value: boolean) => void;
}

export const LayoutLoadingContext = createContext<LayoutLoadingContextValue | null>(null);

export function useLayoutLoading() {
  const context = useContext(LayoutLoadingContext);

  if (!context) {
    throw new Error("useLayoutLoading must be used within LayoutLoadingContext provider");
  }

  return context;
}
