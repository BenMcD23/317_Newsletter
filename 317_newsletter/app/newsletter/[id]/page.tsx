import { notFound } from "next/navigation";
import { getNewsletterById, newsletters } from "@/lib/newsletters";
import PdfBooklet from "@/components/PdfBooklet";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

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
      <div className="font-sans bg-[var(--paper-dark)] border-b border-[var(--rule)] px-6 py-2 text-[0.7rem] tracking-[0.08em] text-[var(--muted)]">
        <Link href="/" className="text-[var(--muted)] no-underline hover:text-[var(--ink)]">
          Home
        </Link>
        {" / "}
        <Link href="/archive" className="text-[var(--muted)] no-underline hover:text-[var(--ink)]">
          Archive
        </Link>
        {" / "}
        <span className="text-[var(--ink)]">
          Issue #{newsletter.issue} — {newsletter.date}
        </span>
      </div>

      <PdfBooklet newsletter={newsletter} />
    </>
  );
}