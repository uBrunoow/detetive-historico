import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  /** Ação principal: tecla de tinta. */
  primary: "px-btn px-btn-ink",
  /** Ação secundária: tecla de papel. */
  secondary: "px-btn px-btn-paper",
  /** Pasta manila: ações de navegação do jogo. */
  manila: "px-btn",
} as const;

type Variant = keyof typeof variants;

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${variants[variant]} ${className}`} {...props} />;
}
