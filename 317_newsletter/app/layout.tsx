import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "317 Airwaves",
  description: "317's monthly newsletter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
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