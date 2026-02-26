"use client"

import Link from "next/link";
import { newsletters } from "@/lib/newsletters";

export default function ArchivePage() {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      {/* Archive header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "0.5rem",
            fontFamily: "Helvetica Neue, sans-serif",
          }}
        >
          Complete Collection
        </p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            fontFamily: "'Times New Roman', Times, serif",
            fontWeight: "700",
            margin: "0 0 1rem",
          }}
        >
          Newsletter Archive
        </h1>
        <hr className="rule-double" style={{ maxWidth: "200px", margin: "0 auto" }} />
      </div>

      {/* Grid of all issues */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {newsletters.map((newsletter, i) => (
          <ArchiveCard
            key={newsletter.id}
            newsletter={newsletter}
            isCurrent={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

function ArchiveCard({
  newsletter,
  isCurrent,
}: {
  newsletter: (typeof newsletters)[0];
  isCurrent: boolean;
}) {
  const color = newsletter.coverColor || "#4A4A4A";

  return (
    <Link
      href={isCurrent ? "/" : `/newsletter/${newsletter.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <article
        className="archive-card"
        style={{
          border: "1px solid var(--rule)",
          background: "var(--paper)",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        }}
      >
        {/* Color band — simulates book spine / cover */}
        <div
          style={{
            background: color,
            height: "120px",
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            padding: "0.75rem 1rem",
          }}
        >
          {/* Subtle texture overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                margin: "0 0 0.2rem",
                fontFamily: "Helvetica Neue, sans-serif",
              }}
            >
              Issue #{newsletter.issue}
            </p>
            <p
              style={{
                color: "#fff",
                fontSize: "1rem",
                fontFamily: "'Times New Roman', serif",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {newsletter.date}
            </p>
          </div>
          {isCurrent && (
            <span
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "0.2rem 0.5rem",
                fontFamily: "Helvetica Neue, sans-serif",
              }}
            >
              Current
            </span>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: "1rem 1.1rem 1.25rem" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontFamily: "'Times New Roman', serif",
              fontWeight: "700",
              margin: "0 0 0.5rem",
            }}
          >
            {newsletter.title}
          </h3>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
              lineHeight: "1.55",
              margin: "0 0 1rem",
              fontStyle: "italic",
            }}
          >
            {newsletter.description}
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: color,
                fontFamily: "Helvetica Neue, sans-serif",
                fontWeight: "600",
              }}
            >
              Read issue →
            </span>
            <a
              href={newsletter.pdfPath}
              download
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                textDecoration: "none",
                fontFamily: "Helvetica Neue, sans-serif",
              }}
            >
              ↓ PDF
            </a>
          </div>
        </div>
      </article>
    </Link>
  );
}
