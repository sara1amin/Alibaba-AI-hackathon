"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSnapshot } from "@/components/ModeProvider";
import { LoadingState } from "@/components/LoadingState";

const ORDER = ["auto_fix", "flag_for_review", "abstain"] as const;

/** /analysis always enters at outcome 1, so the demo starts in the same place. */
export default function AnalysisIndex() {
  const { snapshot } = useSnapshot();
  const router = useRouter();

  React.useEffect(() => {
    if (!snapshot) return;
    const first = [...snapshot.findings].sort(
      (a, b) => ORDER.indexOf(a.verdict as never) - ORDER.indexOf(b.verdict as never),
    )[0];
    if (first) router.replace(`/analysis/${first.id}`);
  }, [snapshot, router]);

  return <LoadingState />;
}
