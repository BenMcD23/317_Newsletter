// lib/newsletters.ts
// ─────────────────────────────────────────────────────────────
// NEWSLETTER CONFIGURATION
// Add new newsletters here. The first entry is shown on the homepage.
// Place your PDF files in /public/newsletters/
// ─────────────────────────────────────────────────────────────

export interface Newsletter {
  id: string;
  title: string;
  date: string;       // e.g. "March 2025"
  issue: number;
  description: string;
  pdfPath: string;    // relative to /public, e.g. "/newsletters/issue-12.pdf"
  coverColor?: string; // optional accent color for the archive card
}

// 🔧 EDIT THIS ARRAY to add/remove newsletters.
// The FIRST item in this array is displayed on the homepage.
export const newsletters: Newsletter[] = [
  {
    id: "issue-1",
    title: "Foundations of Leadership",
    date: "March 2026",
    issue: 1,
    description: "Our inaugural issue highlights the NCO Development Weekend, L98A2 Shooting at RAF Shawbury, Duke of Edinburgh training, archery excellence, and major progress in road marching — showcasing leadership, resilience, and growth across 317 Squadron.",
    pdfPath: "/newsletters/issue-1.pdf",
    coverColor: "#1F2E4A",
  }
];

// Returns the latest (current) newsletter
export function getCurrentNewsletter(): Newsletter {
  return newsletters[0];
}

// Returns all older newsletters (everything except the first)
export function getArchiveNewsletters(): Newsletter[] {
  return newsletters.slice(1);
}

// Find a single newsletter by id
export function getNewsletterById(id: string): Newsletter | undefined {
  return newsletters.find((n) => n.id === id);
}
