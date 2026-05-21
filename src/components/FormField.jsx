export default function FormField({ label, children }) {
  return (
    <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
      {label}
      {children}
    </label>
  );
}
