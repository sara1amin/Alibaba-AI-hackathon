import { findings } from "@/data/findings";
import { AnalysisView } from "./AnalysisView";

/**
 * Server shell around the client view.
 *
 * Its only job is `generateStaticParams`: the site ships as a static export to
 * GitHub Pages, so every finding route has to be enumerable at build time. A
 * client component cannot export that, hence the split.
 */
export function generateStaticParams() {
  return findings.map((f) => ({ id: f.id }));
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  return <AnalysisView id={params.id} />;
}
