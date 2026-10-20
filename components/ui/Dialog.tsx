"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: ReactNode;
};

/**
 * Diálogo modal nativo (`<dialog>` + `showModal`): o navegador cuida do foco preso,
 * da tecla Esc e de devolver o foco a quem abriu.
 */
export function Dialog({ open, onClose, labelledBy, className = "", children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] overflow-y-auto overscroll-contain p-0 text-ink shadow-lifted backdrop:bg-[rgb(18_13_9/0.72)] open:animate-[dialog-in_220ms_cubic-bezier(0.16,1,0.3,1)] ${className}`}
    >
      {open && children}
    </dialog>
  );
}
