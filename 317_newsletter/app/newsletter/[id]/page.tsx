import { notFound } from "next/navigation";
import { getNewsletterById, newsletters } from "@/lib/newsletters";
import PdfBooklet from "@/components/PdfBooklet";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

// Generate static routes for all newsletters
export function generateStaticParams() {
  return newsletters.map((n) => ({ id: n.id }));
}

export default async function NewsletterPage({ params }: Props) {
  const { id } = await params;
  const newsletter = getNewsletterById(id);

  if (!newsletter) notFound();

  return (
    <>
      {/* Breadcrumb */}
      <div
        style={{
          background: "var(--paper-dark)",
          borderBottom: "1px solid var(--rule)",
          padding: "0.6rem 1.5rem",
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          fontFamily: "Helvetica Neue, sans-serif",
          color: "var(--muted)",
        }}
      >
        <Link
          href="/"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          Home
        </Link>
        {" / "}
        <Link
          href="/archive"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          Archive
        </Link>
        {" / "}
        <span style={{ color: "var(--ink)" }}>
          Issue #{newsletter.issue} — {newsletter.date}
        </span>
      </div>

      <PdfBooklet newsletter={newsletter} />
    </>
  );
}
