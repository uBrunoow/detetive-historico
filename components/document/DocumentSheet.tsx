import Image from "next/image";
import type { Presentation } from "@/lib/content/schema";

type Props = {
  presentation: Presentation;
  transcription?: string;
  image?: { src: string; alt: string };
  /** Mostra manuscritos em letra de forma (acessibilidade). */
  plainLetters?: boolean;
  notesLabel?: string;
  /** Carimbo aplicado pelo jogador (ex.: "Arquivado" ao guardar no caderno). */
  overlayStamp?: { text: string; animate: boolean };
};

/**
 * Desenha uma fonte como papel: datilografada, manuscrita, impressa, livro de registro
 * ou desenho. O texto é a própria transcrição, então continua selecionável e legível
 * por leitor de tela.
 */
export function DocumentSheet({ presentation, transcription, image, plainLetters = false, notesLabel, overlayStamp }: Props) {
  const { style, paper = "office", heading, stamp } = presentation;
  const lines = (transcription ?? "").split("\n").filter(Boolean);
  const hand = plainLetters ? "font-sans text-base leading-8" : "font-hand text-lg leading-8";

  return (
    <div
      className="doc-sheet mx-auto w-full max-w-[34rem] px-6 pb-10 pt-8 sm:px-10"
      // No livro de registro, as linhas de pauta são as bordas de cada linha da tabela.
      data-paper={style === "ledger" && paper === "lined" ? "office" : paper}
    >
      {style === "typed" && (
        <div className="font-typed text-[0.98rem] leading-7">
          {heading && (
            <p className="mb-5 border-b-[3px] border-double border-doc-ink pb-2 text-center text-sm font-bold tracking-wide">
              {heading}
            </p>
          )}
          {lines.map((l, i) => (
            <p key={i} className={i === 0 && !heading ? "mb-3 text-center text-lg font-bold" : "mb-2"}>
              {l}
            </p>
          ))}
        </div>
      )}

      {style === "handwritten" && (
        <div className={`${hand} pl-8 text-doc-iron`}>
          {heading && <p className="mb-2 font-typed text-sm font-bold text-doc-faint">{heading}</p>}
          {lines.map((l, i) => (
            <p key={i} className={i === lines.length - 1 && l.length < 12 ? "text-right" : undefined}>
              {l}
            </p>
          ))}
        </div>
      )}

      {style === "printed" && (
        <div className="font-typed">
          {heading && (
            <p className="border-b-4 border-double border-doc-ink pb-1 text-center text-3xl font-bold tracking-tight">
              {heading}
            </p>
          )}
          {lines[0] && (
            <p className="mt-1 border-b border-doc-ink pb-1 text-center text-xs">
              {heading && lines[0].startsWith(heading) ? lines[0].slice(heading.length).replace(/^\s*—\s*/, "") : lines[0]}
            </p>
          )}
          <div className="mt-4 text-[0.95rem] leading-6 sm:columns-2 sm:gap-6">
            {lines.slice(1).map((l, i) => {
              const [lead, ...rest] = l.split(": ");
              return rest.length ? (
                <p key={i} className="mb-2">
                  <strong className="block text-lg leading-6">{lead}</strong>
                  {rest.join(": ")}
                </p>
              ) : (
                <p key={i} className="mb-2">
                  {l}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {style === "ledger" && (
        <div className="pl-8">
          {heading && <p className="mb-2 font-typed text-sm font-bold text-doc-faint">{heading}</p>}
          <ul className={`${hand} border-t border-doc-rule text-doc-iron`}>
            {lines.map((l, i) => {
              const cells = l.split(" — ");
              return (
                <li
                  key={i}
                  className="grid grid-cols-[5.5rem_1fr] gap-x-3 border-b border-doc-rule py-1 sm:grid-cols-[6rem_1fr_1fr]"
                >
                  <span>{cells[0]}</span>
                  <span>{cells[1]}</span>
                  {cells[2] && <span className="col-start-2 sm:col-start-auto">{cells.slice(2).join(" — ")}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {style === "drawing" && (
        <div>
          {image && (
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={600}
              unoptimized
              className="h-auto w-full mix-blend-multiply"
            />
          )}
          {lines.length > 0 && (
            <div className={`${hand} mt-4 text-doc-iron`}>
              {notesLabel && <p className="font-typed text-sm font-bold text-doc-faint">{notesLabel}</p>}
              {lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {overlayStamp && (
        <div
          role="img"
          aria-label={`Carimbo: ${overlayStamp.text}`}
          className={`doc-stamp absolute -top-3 right-3 z-10 rotate-[-9deg] px-4 py-0.5 text-2xl font-bold uppercase tracking-[0.08em] sm:right-6 ${
            overlayStamp.animate ? "animate-[stamp-in_420ms_cubic-bezier(0.16,1,0.3,1)_both]" : ""
          }`}
        >
          {overlayStamp.text}
        </div>
      )}

      {stamp && (
        <div
          aria-label={`Carimbo: ${stamp.text}${stamp.detail ? `, ${stamp.detail}` : ""}`}
          role="img"
          className="doc-stamp absolute bottom-5 right-5 rotate-[-9deg] px-3 py-1 text-center"
        >
          <span className="block text-lg font-bold uppercase tracking-[0.08em]">{stamp.text}</span>
          {stamp.detail && <span className="block text-xs font-semibold">{stamp.detail}</span>}
        </div>
      )}
    </div>
  );
}
