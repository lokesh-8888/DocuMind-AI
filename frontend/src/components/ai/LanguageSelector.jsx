const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada"];

export default function LanguageSelector({ value = "English", onChange = () => {} }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-brand"
    >
      {languages.map((language) => (
        <option key={language} value={language}>
          {language}
        </option>
      ))}
    </select>
  );
}
