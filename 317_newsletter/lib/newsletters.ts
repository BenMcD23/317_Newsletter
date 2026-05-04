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

// The FIRST item in this array is displayed on the homepage.
export const newsletters: Newsletter[] = [
  {
    id: "issue-2",
    title: "Guess Who's Back, Back Again?",
    date: "May 2026",
    issue: 2,
    description: "Our building might be closed at the moment, but we haven't let that stop us from delivering high quality content and providing great opportunities for our cadets. Catchup on a few of the things we have been up to here in Issue 2!",
    pdfPath: "/newsletters/issue-2.pdf",
    coverColor: "#1F2E4A",
  },
  {
    id: "issue-1",
    title: "2026 is a-go!",
    date: "March 2026",
    issue: 1,
    description: "The inaugural issue of the 317 Squadron Newsletter. It's been a very busy start to 2026 with plenty of activities to recap, enjoy the first production of our new media team!",
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
