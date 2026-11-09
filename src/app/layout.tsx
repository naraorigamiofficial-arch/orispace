import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ORISPACE", template: "%s | ORISPACE" },
  description: "Original origami designs, credited to their creators, with everything you need to fold them.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#151412" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line py-8 text-center text-sm text-muted">
          <p>Every design on ORISPACE is credited to the designer who created it.</p>
          <p className="mt-2">
            <Link href="/about/staff" className="underline underline-offset-4">
              About ORISPACE Staff
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
