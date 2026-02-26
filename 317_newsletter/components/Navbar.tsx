"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { newsletters } from "@/lib/newsletters";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "var(--ink)",
        color: "var(--paper)",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {/* Top strip */}
      <div
        style={{
          background: "var(--accent)",
          textAlign: "center",
          padding: "0.25rem",
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#f5ebe0",
        }}
      >
        Est. {new Date().getFullYear()} &nbsp;·&nbsp; Monthly Edition
      </div>

      {/* Masthead */}
      <div
        style={{
          textAlign: "center",
          padding: "1.5rem 1rem 0.75rem",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <h1
            className="masthead-title"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: "700",
              color: "#f5f0e8",
              margin: 0,
              lineHeight: 1,
            }}
          >
            317 Airwaves
          </h1>
          <p
            style={{
              fontStyle: "italic",
              color: "rgba(245,240,232,0.55)",
              fontSize: "0.85rem",
              margin: "0.35rem 0 0",
              letterSpacing: "0.05em",
            }}
          >
            {newsletters[0].date} &nbsp;·&nbsp; Issue #{newsletters[0].issue}
          </p>
        </Link>
      </div>

      {/* Nav links */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <NavLink href="/" active={pathname === "/"}>
          Current Issue
        </NavLink>
        <NavLink href="/archive" active={pathname.startsWith("/archive")}>
          Archive
        </NavLink>
        {/* Add more nav items as needed */}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "0.6rem 1.75rem",
        fontSize: "0.72rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        textDecoration: "none",
        color: active ? "#f5f0e8" : "rgba(245,240,232,0.5)",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        transition: "color 0.15s, border-color 0.15s",
        fontFamily: "Helvetica Neue, Helvetica, sans-serif",
        fontWeight: active ? "600" : "400",
      }}
    >
      {children}
    </Link>
  );
}
