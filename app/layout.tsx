import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-serif", weight: ["400", "600", "700", "900"] });

export const metadata: Metadata = {
  title: "Chetna Verma | B.A. LL.B Scholar & Legal Intern | CGC University Mohali",
  description: "Official legal portfolio of Chetna Verma, B.A. LL.B 1st year law student at CGC University Mohali with schooling from Mount Litera Zee School (60%) & KV Kathua (57%). Seeking legal internships.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${cinzel.variable} font-sans min-h-screen flex flex-col relative bg-[#f6faf8]`}>
        <div className="fixed inset-0 bg-court-pattern z-[-1] pointer-events-none opacity-50" />
        {children}
      </body>
    </html>
  );
}
