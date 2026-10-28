import { PixelSprite } from "./PixelSprite";

// As nuvens atravessam a tela devagar, cada uma no seu tempo.
const CLOUDS = [
  { left: "4%", top: "1.5rem", width: "clamp(10rem,26vw,22rem)", duration: "80s", delay: "0s" },
  { left: "50%", top: "5rem", width: "clamp(8rem,18vw,16rem)", duration: "110s", delay: "-40s" },
  { left: "92%", top: "2.5rem", width: "clamp(10rem,30vw,26rem)", duration: "95s", delay: "-70s" },
];

/**
 * A noite de todas as telas, em duas camadas: o fundo (estrelas, lua, nuvens, morcegos e chão)
 * fica atrás de tudo; a frente (neblina, poças, chuva e raio) passa por cima do cenário.
 * É só decoração.
 */
export function NightSky({
  rain = true,
  flash = false,
  moon = false,
  bats = false,
  ground = true,
}: {
  rain?: boolean;
  flash?: boolean;
  moon?: boolean;
  bats?: boolean;
  ground?: boolean;
}) {
  return (
    <>
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="night-stars absolute inset-0" />
      {moon && (
        <PixelSprite name="moon" className="absolute right-[7%] top-20 hidden w-12 sm:block drop-shadow-[0_0_24px_rgb(241_230_200/0.35)] sm:w-20" />
      )}
      {CLOUDS.map((c) => (
        <div
          key={c.left}
          className="night-cloud absolute opacity-50"
          style={{ left: c.left, top: c.top, width: c.width, animationDuration: c.duration, animationDelay: c.delay }}
        >
          <PixelSprite name="cloud" />
        </div>
      ))}
      {bats &&
        [
          { left: "62%", top: "18%", delay: "0s" },
          { left: "78%", top: "26%", delay: "-4s" },
        ].map((b) => (
          <div key={b.left} className="night-cloud absolute w-8" style={{ left: b.left, top: b.top, animationDuration: "14s", animationDelay: b.delay }}>
            <PixelSprite name="bat" className="sprite-bob" />
          </div>
        ))}
      {ground && <div className="night-ground absolute inset-x-0 bottom-0 h-8" />}
    </div>
    {/* Frente: o clima passa por cima do cenário e por baixo dos painéis (z 5; o conteúdo fica em z 10). */}
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <div className="night-fog absolute bottom-6 left-0 flex w-[200%] opacity-35">
        <PixelSprite name="fog" className="w-1/2" />
        <PixelSprite name="fog" className="w-1/2" />
      </div>
      {ground && (
        <>
          <span className="night-puddle absolute bottom-2 left-[50%] h-1 w-[12%]" />
          <span className="night-puddle absolute bottom-3 left-[14%] h-1 w-[7%] [animation-delay:-1s]" />
        </>
      )}
      {rain && <div className="night-rain absolute inset-0 opacity-50" />}
      {flash && <div className="night-flash absolute inset-0" />}
    </div>
    </>
  );
}
