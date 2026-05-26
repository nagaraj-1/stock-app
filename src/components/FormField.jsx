export default function FormField({ label, children }) {
  return (
    <label className="grid gap-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
      {label}
      {children}
    </label>
  );
}
