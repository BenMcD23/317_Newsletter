"use client";

import { useRouter } from "next/navigation";
import { newsletters } from "@/lib/newsletters";

export default function ArchivePage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[var(--accent)] mb-2">
          Complete Collection
        </p>
        <h1 className="text-[clamp(1.8rem,5vw,3rem)] font-bold m-0 mb-4">
          Newsletter Archive
        </h1>
        <hr className="rule-double max-w-[200px] mx-auto" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
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
  const router = useRouter();
  const color = newsletter.coverColor || "#4A4A4A";

  const handleCardClick = () => {
    router.push(isCurrent ? "/" : `/newsletter/${newsletter.id}`);
  };

  return (
    <article
      className="archive-card border border-[var(--rule)] bg-[var(--paper)] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.07)] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Color band */}
      <div
        className="h-[120px] relative flex items-end px-4 py-3"
        style={{ background: color }}
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)]" />
        <div className="relative z-10">
          <p className="text-white/70 text-[0.6rem] tracking-[0.25em] uppercase mb-0.5">
            Issue #{newsletter.issue}
          </p>
          <p className="text-white text-base font-bold m-0">
            {newsletter.date}
          </p>
        </div>

        {isCurrent && (
          <span className="absolute top-3 right-3 bg-[var(--accent)] text-white text-[0.55rem] tracking-[0.15em] uppercase px-2 py-0.5">
            Current
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="px-4 pt-4 pb-5">
        <h3 className="text-base font-bold m-0 mb-2">
          {newsletter.title}
        </h3>

        <p className="text-[0.8rem] text-[var(--muted)] leading-[1.55] italic m-0 mb-4">
          {newsletter.description}
        </p>

        <div className="flex gap-3 items-center">
          <span
            className="text-[0.65rem] tracking-[0.15em] uppercase font-semibold"
            style={{ color }}
          >
            Read issue
          </span>

          <a
            href={newsletter.pdfPath}
            download
            onClick={(e) => e.stopPropagation()}
            className="text-[0.65rem] tracking-[0.1em] uppercase text-[var(--muted)] no-underline relative z-20"
          >
            ↓ PDF
          </a>
        </div>
      </div>
    </article>
  );
}