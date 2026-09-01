import { repos } from "@/data/repos";
import { RepoOverview } from "./RepoOverview";

/** Static export needs every repository route enumerable at build time. */
export function generateStaticParams() {
  return repos.map((r) => ({ repo: r.name }));
}

export default function RepoPage({ params }: { params: { repo: string } }) {
  return <RepoOverview repoName={params.repo} />;
}
