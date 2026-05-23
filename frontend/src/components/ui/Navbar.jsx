import { MessageSquareText } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex h-14 items-center gap-2 border-b border-line bg-white px-4">
      <MessageSquareText className="h-5 w-5 text-brand" />
      <span className="font-semibold">DocuMind AI</span>
    </header>
  );
}
