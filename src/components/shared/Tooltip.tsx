export default function Tooltip({ label }: { label: string }) {
  return (
    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-xl border border-white/10 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
      {label}
      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-white/10 rotate-45" />
    </div>
  );
}
