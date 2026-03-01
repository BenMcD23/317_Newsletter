import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Failsworth Foundry",
  description: "317's monthly newsletter",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-poppins">
        <Navbar />
        <main>{children}</main>
        <footer className="px-6 py-8 text-center text-xs tracking-widest uppercase text-[var(--muted)] bg-[var(--paper-dark)]">
          <p>© {new Date().getFullYear()} 317 Squadron &nbsp;·&nbsp; All rights reserved</p>
        </footer>
      </body>
    </html>
  );
}