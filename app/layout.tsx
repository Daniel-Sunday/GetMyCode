import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetMyCode",
  description: "Secure attendance code verification portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased bg-buttermilk text-navy min-h-screen flex flex-col overflow-x-hidden w-full"
      >
        <Toaster position="top-right" />
        <NavBar />
        <main className="pt-16 flex-1 flex flex-col px-4 md:px-8 max-w-[1200px] mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
