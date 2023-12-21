import "./theme/index.css";
// import "./theme/orderly.theme.css";
import "./theme/woo.theme.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
