import { getCurrentNewsletter } from "@/lib/newsletters";
import PdfBooklet from "@/components/PdfBooklet";

export default function Home() {
  const current = getCurrentNewsletter();

  return <PdfBooklet newsletter={current} />;
}
