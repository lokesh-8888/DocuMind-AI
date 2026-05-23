export default function QuizGenerator({ questions }) {
  if (!questions?.length) return <p className="text-sm text-slate-500">No quiz generated yet.</p>;
  return (
    <div className="space-y-4">
      {questions.map((item, index) => (
        <div key={`${item.question}-${index}`} className="rounded-lg border border-line bg-white p-3">
          <p className="text-sm font-semibold">{index + 1}. {item.question}</p>
          <div className="mt-2 grid gap-1">
            {item.options.map((option) => (
              <span key={option} className={`rounded border px-2 py-1 text-xs ${option === item.answer ? "border-brand bg-teal-50" : "border-line"}`}>
                {option}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
