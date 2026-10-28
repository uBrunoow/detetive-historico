export function StarRating({
  stars,
  size = "sm",
  label = true,
}: {
  stars: number;
  size?: "sm" | "lg";
  label?: boolean;
}) {
  const count = Math.max(0, Math.min(3, stars));
  return (
    <span className={`inline-flex items-center gap-2 font-sans font-bold ${size === "lg" ? "text-3xl" : "text-lg"}`} aria-label={`${count} de 3 estrelas`}>
      <span aria-hidden className="tracking-tight text-sun">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < count ? "" : "text-white/45"}>★</span>
        ))}
      </span>
      {label && <span className="sr-only">{count} de 3 estrelas</span>}
    </span>
  );
}
