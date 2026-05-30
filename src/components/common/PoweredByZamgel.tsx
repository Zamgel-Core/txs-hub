// 📍 Ruta: src/components/common/PoweredByZamgel.tsx

export function PoweredByZamgel() {
  return (
    <a
      href="https://zamgelcore.com"
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center justify-center gap-2 rounded-full border border-zinc-800/80 bg-black/30 px-4 py-2 text-xs text-zinc-500 transition hover:border-orange-500/40 hover:text-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.12)]"
    >
      <img
        src="/branding/zamgelcore-zc-logo.png"
        alt="Zamgel Core"
        className="h-5 w-auto opacity-70 transition-opacity group-hover:opacity-100"
      />

      <span>
        Powered by{" "}
        <span className="font-semibold text-zinc-300 group-hover:text-orange-400">
          Zamgel Core
        </span>
      </span>
    </a>
  );
}