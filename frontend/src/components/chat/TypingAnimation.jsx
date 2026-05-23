export default function TypingAnimation() {
  return (
    <div className="flex items-center gap-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((dot) => (
        <span key={dot} className="h-2 w-2 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: `${dot * 120}ms` }} />
      ))}
    </div>
  );
}
