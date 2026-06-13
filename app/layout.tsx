import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rekapan Lembur TPP - PT Borneo Alumina Indonesia",
  description: "Aplikasi Rekapan Lembur Operator Divisi Thermal Power Plant PT Borneo Alumina Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#334155', color: '#fff' } }} />
      </body>
    </html>
  );
}
