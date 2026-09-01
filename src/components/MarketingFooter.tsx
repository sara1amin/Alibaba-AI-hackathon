import { Mark } from "./Brand";

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-8 gap-y-4 px-5 py-8">
        <div className="flex items-center gap-2.5">
          <Mark size={18} />
          <span className="text-caption tracking-normal text-mid">
            PipelineGuard — built for the Alibaba Cloud AI Hackathon Pakistan 2026
          </span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-caption tracking-normal text-faint">
          <span>Reasoning by Qwen · Alibaba Cloud Model Studio</span>
          <a
            href="https://github.com/sara1amin/Alibaba-AI-hackathon"
            className="transition-colors hover:text-ink"
            target="_blank"
            rel="noreferrer noopener"
          >
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}
