import type { Metadata } from "next";
import { Roboto, Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "700"],
  style: ["normal"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Innovation Conners",
  description: "create by Innovation Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${notoThai.variable} ${geistMono.variable} antialiased`}>
        <header className="w-full border-b border-white/10 bg-[#0f1220]/30">
          <nav className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">               
              <span className="text-lg font-bold opacity-90 text-yellow-300">Innovation Conners</span>
            </div>
            <div className="flex items-center gap-2">
              {/* <a href="#" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 transition" aria-label="analytics">
                <span>♡</span>
              </a> */}
              {/* <a href="/create-question" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 transition" aria-label="team">
                <span>👥</span>
              </a>
              <a href="/" className="ml-2 inline-flex items-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                เข้าสู่ระบบ
              </a> */}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
