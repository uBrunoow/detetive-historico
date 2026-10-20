import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Arte 320×200 cobrindo a tela inteira, ancorada embaixo. As camadas filhas usam
 * porcentagens da própria arte, então ficam alinhadas em qualquer tamanho de tela.
 */
export function PixelBackdrop({ src, alt, children }: { src: string; alt: string; children?: ReactNode }) {
  return (
    <div aria-hidden={alt ? undefined : true} className="pointer-events-none absolute inset-0 overflow-hidden bg-[#141a2b]">
      <div className="absolute bottom-0 left-1/2 aspect-[16/10] w-[max(100vw,160dvh)] -translate-x-1/2">
        <Image src={src} alt={alt} fill priority unoptimized className="pixelated object-cover" />
        {children}
      </div>
    </div>
  );
}
