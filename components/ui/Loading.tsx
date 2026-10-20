import { strings } from "@/lib/strings/pt-BR";

/** Estado de carregamento: uma folha sendo puxada da gaveta. */
export function Loading({ dark = false }: { dark?: boolean }) {
  return (
    <div
      role="status"
      className={`flex min-h-dvh flex-1 items-center justify-center ${dark ? "bg-wood text-on-wood" : "text-paper-5"}`}
    >
      <p className="animate-pulse font-pixel text-sm font-bold">{strings.app.loading}</p>
    </div>
  );
}
