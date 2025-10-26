"use client";

import { usePathname } from "next/navigation";
import AuthNav from "@/components/auth-nav";
import BackgroundProvider from "@/components/background-provider";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  console.log("pathname >> ", pathname);
  
  return (
    <>
      {/* Hide header on login page */}
      {pathname !== '/login' && (
        <header className="w-full border-b border-white/10 bg-[#0f1220]">
          <nav className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold opacity-90 text-yellow-300">Innovation Conners</span>
            </div>
            <AuthNav />
          </nav>
        </header>
      )}
      <div className="block max-w-[1200px] mx-auto">
        <BackgroundProvider>
          {children}
        </BackgroundProvider>
      </div>
    </>
  );
}