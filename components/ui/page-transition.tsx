"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

/**
 * #3 Page Transition — Pixel dissolve effect between routes.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayKey, setDisplayKey] = useState(pathname);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (pathname !== displayKey) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayKey(pathname);
        setAnimating(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname, displayKey]);

  return (
    <div key={displayKey} className={animating ? "" : "page-enter"}>
      {children}
    </div>
  );
}
