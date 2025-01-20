import { useEffect, useRef } from "react";

export function useIsInitialRender() {
  const isInitial = useRef(true);
  useEffect(() => {
    isInitial.current = false;
  }, []);
  return isInitial.current;
}
