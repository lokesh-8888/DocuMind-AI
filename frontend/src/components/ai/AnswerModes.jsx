const modes = ["Precise", "Detailed", "Study"];

export default function AnswerModes({ value = "Precise", onChange = () => {} }) {
  return (
    <div className="inline-grid grid-cols-3 gap-1 rounded-lg border border-line bg-white p-1">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`h-9 rounded-md px-3 text-xs font-semibold ${value === mode ? "bg-teal-50 text-brand" : "text-slate-500 hover:bg-slate-50"}`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
