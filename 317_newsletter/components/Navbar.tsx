"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { newsletters } from "@/lib/newsletters";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[var(--ink)] text-[var(--paper)]">
      {/* Top strip */}
      <div className="bg-[var(--accent)] text-center py-1 text-[0.65rem] tracking-[0.25em] uppercase text-[#f5ebe0]">
        Est. {new Date().getFullYear()} &nbsp;·&nbsp; Monthly Edition
      </div>

      {/* Masthead */}
      <div className="text-center px-4 pt-6 pb-3 border-b border-white/10">
        <Link href="/" className="no-underline text-inherit">
          <h1 className="masthead-title text-[clamp(2.5rem,7vw,5rem)] font-bold text-[#f5f0e8] m-0 leading-none">
            Failsworth Foundry
          </h1>
          <p className="italic text-[rgba(245,240,232,0.55)] text-[0.85rem] mt-1.5 mb-0 tracking-[0.05em]">
            {newsletters[0].date} &nbsp;·&nbsp; Issue #{newsletters[0].issue}
          </p>
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex justify-center border-b border-white/10">
        <NavLink href="/" active={pathname === "/"}>
          Current Issue
        </NavLink>
        <NavLink href="/archive" active={pathname.startsWith("/archive")}>
          Archive
        </NavLink>
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
      className={[
        "inline-block px-7 py-2.5 text-[0.72rem] tracking-[0.18em] uppercase no-underline transition-colors duration-150",
        active
          ? "text-[#f5f0e8] font-semibold border-b-2 border-[var(--accent)]"
          : "text-[rgba(245,240,232,0.5)] font-normal border-b-2 border-transparent hover:text-[rgba(245,240,232,0.8)]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}