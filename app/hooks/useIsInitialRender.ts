import { useEffect, useState } from "react";

export function useIsInitialRender() {
  const [isInitial, setIsInitial] = useState(true);
  useEffect(() => {
    setIsInitial(false);
  }, []);
  return isInitial;
}
