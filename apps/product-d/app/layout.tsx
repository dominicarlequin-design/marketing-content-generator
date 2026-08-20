import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riverside Books — Content Generator",
  description: "Generate social posts, newsletter blurbs, and staff pick cards for Riverside Books.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
