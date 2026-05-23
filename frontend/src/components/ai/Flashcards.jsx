export default function Flashcards({ cards }) {
  if (!cards?.length) return <p className="text-sm text-slate-500">No flashcards generated yet.</p>;
  return (
    <div className="grid gap-3">
      {cards.map((card, index) => (
        <div key={`${card.front}-${index}`} className="rounded-lg border border-line bg-white p-3">
          <p className="text-sm font-semibold">{card.front}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.back}</p>
        </div>
      ))}
    </div>
  );
}
