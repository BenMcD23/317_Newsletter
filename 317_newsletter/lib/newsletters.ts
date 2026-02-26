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
    id: "issue-2",
    title: "The Dispatch",
    date: "January 2026",
    issue: 2,
    description: "Our January edition — new year perspectives, reader highlights, and the stories that defined the month.",
    pdfPath: "/newsletters/issue-2.pdf",
    coverColor: "#2C5F6C",
  },
  {
    id: "issue-1",
    title: "The Dispatch",
    date: "December 2025",
    issue: 1,
    description: "The very first issue — where it all began. Founder's note, inaugural stories, and our vision for what's ahead.",
    pdfPath: "/newsletters/issue-1.pdf",
    coverColor: "#4A4A6A",
  },
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
