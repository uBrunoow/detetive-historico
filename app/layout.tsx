import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Courier_Prime, Jacquard_24, Jersey_10, Kalam } from "next/font/google";
import { IrisNav } from "@/components/pixel/IrisNav";
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

// Fonte pixel do jogo (títulos, botões, HUD) e o letreiro gótico, só no nome do jogo.
const jersey = Jersey_10({
  variable: "--font-jersey",
  subsets: ["latin"],
  weight: "400",
});

const jacquard = Jacquard_24({
  variable: "--font-jacquard",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: { default: strings.app.name, template: `%s · ${strings.app.name}` },
  description: strings.app.description,
};

const directionContract = `
THESIS: Noir 16-bit: um jogo de investigação em pixel art numa cidade à noite (linhagem das aventuras point-and-click e dos plataformas 2D), onde os documentos são o único papel claro da tela.
OWN-WORLD: Céu índigo em faixas, estrelas, chuva e neblina em pixel, chão de pedra molhada, poste âmbar; dossiês em pergaminho com tinta-ameixa; vermelho-sangue para a ação principal, o barbante e o carimbo; âmbar para luz, pontos e escolha. Jersey 10 em títulos, botões e HUD; Jacquard 24 só no letreiro; leitura em Atkinson Hyperlegible Next, Courier Prime e Kalam.
STORY: O aluno abre o jogo na rua do Arquivo à noite, escolhe um caso no quadro de alfinetes, examina a cena com a lanterna, guarda fontes, ordena-as no barbante e dá o veredito: a época (A a E) e a ordem.
SOURCE: mockup aprovado pelo dono em 28/10/2026, public/mockup/index.html; decisões em DESIGN.md e DECISOES.md (D21).
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${atkinson.variable} ${courierPrime.variable} ${kalam.variable} ${jersey.variable} ${jacquard.variable} h-full antialiased`}
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
        <IrisNav />
      </body>
    </html>
  );
}
