import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetCode",
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
        className="font-sans antialiased bg-buttermilk text-navy min-h-screen flex flex-col"
      >
        <Toaster position="top-right" />
        <NavBar />
        <main className="pt-16 flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
