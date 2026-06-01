// lib/newsletters.ts
// ─────────────────────────────────────────────────────────────
// NEWSLETTER CONFIGURATION
// Newsletter data lives in newsletters.json and is managed via the
// 317 SMS site (Tools → Newsletter Management). The first entry in the
// array is shown on the homepage. PDFs live in /public/newsletters/.
// ─────────────────────────────────────────────────────────────

import data from "./newsletters.json";

export interface Newsletter {
  id: string;
  title: string;
  date: string;       // e.g. "March 2025"
  issue: number;
  description: string;
  pdfPath: string;    // relative to /public, e.g. "/newsletters/issue-12.pdf"
  coverColor?: string; // optional accent color for the archive card
}

// The FIRST item in this array is displayed on the homepage.
export const newsletters: Newsletter[] = data as Newsletter[];

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
