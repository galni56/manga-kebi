export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gold/50" />
      <span className="text-xs">✦</span>
      <span className="h-px w-12 bg-gold/50" />
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  light = false,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div className="mb-10 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      <h2 className={`font-display text-3xl font-extrabold leading-tight sm:text-4xl ${light ? "text-[#fbf7f0]" : "text-ink"}`}>
        {title}
      </h2>
      <Ornament className="mt-4" />
    </div>
  );
}
