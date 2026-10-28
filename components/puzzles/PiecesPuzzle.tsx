"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { correctCount, isSolved, shuffle, swap } from "@/lib/game/pieces";
import { Button } from "@/components/ui/Button";

export function PiecesPuzzle({ image, onFinish }: {
  image: { src: string; alt: string };
  onFinish: (how: "solved" | "skipped") => Promise<void>;
}) {
  const [order, setOrder] = useState(() => shuffle(6, image.src.length));
  const [selected, setSelected] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const finished = useRef(false);
  const solved = isSolved(order);
  const canSkip = now - startedAt >= 60000;
  const pieces = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

  useEffect(() => {
    if (solved && !finished.current) {
      finished.current = true;
      void onFinish("solved");
    }
  }, [solved, onFinish]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section aria-label="Montar a fonte em peças" className="mt-5 border-t border-dashed border-paper-4 pt-4">
      <div className="grid grid-cols-3 gap-1" role="grid" aria-label="Peças da fonte">
        {pieces.map((position) => (
          <button
            key={position}
            type="button"
            role="gridcell"
            aria-label={`Peça ${order[position] + 1}, posição ${position + 1}`}
            onClick={() => {
              if (selected === null) setSelected(position);
              else { setOrder((current) => swap(current, selected, position)); setSelected(null); }
            }}
            className={`aspect-[4/3] min-h-touch border-2 bg-cover bg-center pixelated ${selected === position ? "border-ribbon" : "border-ink"}`}
            style={{ backgroundImage: `url(${image.src})`, backgroundPosition: `${(order[position] % 3) * 50}% ${Math.floor(order[position] / 3) * 100}%` }}
          />
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-sm">Peça {selected === null ? "—" : selected + 1} selecionada. {correctCount(order)} de 6 no lugar certo. {solved ? "Fonte montada!" : ""}</p>
      {canSkip && !solved && <Button variant="secondary" className="mt-3" onClick={async () => { await onFinish("skipped"); }}>Pular</Button>}
    </section>
  );
}
