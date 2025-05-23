import { createContext } from "react";
import { useIsInitialRender } from "../hooks/useIsInitialRender";

export const GlobalInitialRenderContext = createContext<boolean>(false);

export const GlobalInitialRenderProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <GlobalInitialRenderContext.Provider value={useIsInitialRender()}>
      {children}
    </GlobalInitialRenderContext.Provider>
  );
};
