import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@orderly.network/react/dist/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orderly SDK Example",
  description: "Orderly SDK Example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
