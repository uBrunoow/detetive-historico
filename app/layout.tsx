import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Courier_Prime, Kalam, Pixelify_Sans } from "next/font/google";
import { settingsBootScript } from "@/lib/settings/boot";
import { strings } from "@/lib/strings/pt-BR";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400"],
});

const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: strings.app.name, template: `%s · ${strings.app.name}` },
  description: strings.app.description,
};

const directionContract = `
THESIS: Um jogo de aventura em pixel art numa repartição de arquivo (linhagem Papers, Please e aventuras point-and-click 320x200): a fonte fala em tipo de máquina sobre papel, o arquivo fala por carimbo; recusa o app escolar de cartões arredondados.
OWN-WORLD: Cenas 320x200 em paleta fechada de madeira, parede verde-cinza, manila, papel e noite; molduras e botões pixel com cantos em degrau e sombra sólida; Pixelify Sans em títulos, botões e HUD; leitura nítida em Atkinson Hyperlegible Next, Courier Prime e Kalam; azul-carbono só para o foco do jogador; carimbo roxo para o sistema.
STORY: O aluno abre o jogo na fachada do Arquivo Municipal à noite, escolhe um caso, examina a cena com a lupa, guarda fontes, ordena-as e escreve sua conclusão.
FIRST VIEWPORT: Home: fachada do arquivo em pixel ocupando a tela, uma janela acesa, letreiro "Detetive Histórico" e o menu Jogar/Continuar/Como jogar/Opções/Créditos à esquerda. Cena: ilustração ocupa a mesa, abas de lugar em pasta manila, HUD de fontes no topo.
FORM: Fusão pedida pelo usuário: pixel art 2D sobre a direção sorteada Repartição datilografada (seed c7c5728c).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${atkinson.variable} ${courierPrime.variable} ${kalam.variable} ${pixelify.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsBootScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: `<!--${directionContract}-->` }} />
        <a
          href="#conteudo"
          className="sr-only z-50 bg-paper-0 px-4 py-3 font-pixel font-bold text-ink px-frame focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          {strings.app.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
