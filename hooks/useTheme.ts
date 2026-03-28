"use client";
import { useState, useEffect, useCallback } from "react";

function applyTheme(dark: boolean) {
  try {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  } catch { /* SSR */ }
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false); // white is default

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ncv_theme");
      const dark = saved === "dark";
      setIsDark(dark);
      applyTheme(dark);
    } catch { /* SSR */ }
  }, []);

  const toggle = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try {
        localStorage.setItem("ncv_theme", next ? "dark" : "light");
        applyTheme(next);
      } catch { /* SSR */ }
      return next;
    });
  }, []);

  return { isDark, toggle };
}
