export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-lg font-black tracking-tight">Cartly</span>
        <p className="text-xs text-white/40 text-center sm:text-right">
          &copy; {new Date().getFullYear()} Cartly.ba. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
}
