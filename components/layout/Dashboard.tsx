"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const childrenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(
    function () {
      if (!childrenContainerRef.current) return;
      childrenContainerRef.current.scrollTo(0, 0);
    },
    [pathname, searchParams],
  );

  return (
    <main className="grid h-screen w-screen grid-cols-[auto_1fr] overflow-auto overflow-x-hidden">
      <Sidebar />

      <div className="w-full overflow-hidden">
        <Topbar />
        <div
          ref={childrenContainerRef}
          className="h-full max-h-[calc(100vh-48px)] w-full overflow-auto overflow-x-hidden px-8 pb-20 pt-6"
        >
          {children}
        </div>
      </div>
    </main>
  );
}
