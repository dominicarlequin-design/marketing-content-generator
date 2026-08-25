import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthNav } from "@/components/AuthNav";

export const metadata: Metadata = {
  title: "Riverside Books — Ordering & Loyalty",
  description: "Browse titles, order books, and track loyalty rewards at Riverside Books.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="mx-auto flex max-w-2xl items-center justify-between p-8 pb-0">
          <Link href="/" className="text-lg font-semibold">
            Riverside Books
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-sm underline">
              Cart
            </Link>
            <AuthNav />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
