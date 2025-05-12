"use client";

import { createContext, useContext, useState } from "react";

const LoaderContext = createContext({
  isLoading: false,
  setIsLoading: (_: boolean) => {},
});

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoaderContext.Provider>
  );
}

export const useLoader = () => useContext(LoaderContext);
