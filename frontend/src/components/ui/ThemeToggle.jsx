import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ dark = false, onToggle = () => {} }) {
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white hover:bg-slate-50"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
