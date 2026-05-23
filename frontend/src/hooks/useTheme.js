import { useEffect, useState } from "react";

export default function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, setDark, toggle: () => setDark((value) => !value) };
}
