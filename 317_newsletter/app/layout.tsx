import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "The Dispatch — Newsletter",
  description: "Our monthly newsletter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <footer
          style={{
            padding: "2rem 1.5rem",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "var(--paper-dark)",
          }}
        >
          <p>© {new Date().getFullYear()} 317 Squadron &nbsp;·&nbsp; All rights reserved</p>
        </footer>
      </body>
    </html>
  );
}
