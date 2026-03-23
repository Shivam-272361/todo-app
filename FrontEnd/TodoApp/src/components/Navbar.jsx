import { CheckCheck, Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[color:rgba(8,10,20,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <CheckCheck className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Todo Studio
            </p>
            <h1 className="text-lg font-semibold tracking-[0.08em] text-white">
              Human workflow, not a demo.
            </h1>
          </div>
        </div>

        <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/70 md:flex">
          <Sparkles className="h-4 w-4 text-[var(--accent-soft)]" />
          <span>Plan it. Shape it. Finish it.</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
