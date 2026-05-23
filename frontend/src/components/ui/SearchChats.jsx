import { Search } from "lucide-react";

export default function SearchChats({ value = "", onChange = () => {} }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search chats"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
    </label>
  );
}
