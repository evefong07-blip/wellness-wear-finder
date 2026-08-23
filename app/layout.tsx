import type { Metadata } from "next";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wellness Wear Finder",
  description: "Find an everyday wellness-wear category suited to your comfort and routine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/"><span className="brand-mark">W</span><span>Wellness Wear<small>Finder</small></span></Link>
          <NavLinks />
        </header>
        {children}
        <footer>Wellness Wear Finder <span>·</span> Everyday comfort, thoughtfully matched.</footer>
      </body>
    </html>
  );
}
