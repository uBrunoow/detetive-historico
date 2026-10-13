import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Courier_Prime } from "next/font/google";
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

export const metadata: Metadata = {
  title: { default: strings.app.name, template: `%s · ${strings.app.name}` },
  description: strings.app.description,
};

const directionContract = `
THESIS: A fonte fala em tipo de máquina, o jogador escreve a grafite e o arquivo só se manifesta por carimbo roxo; recusa o app escolar de cartões arredondados e cores vivas.
OWN-WORLD: Repartição datilografada. Papel de ofício em 7 tons frios, tinta preta e vermelha de fita, carimbo roxo, azul-carbono só para o foco do jogador, pasta manila, tampo de madeira; Courier Prime para fontes e títulos, Atkinson Hyperlegible Next para leitura.
STORY: O aluno entende o caso, examina a cena, recolhe fichas com código de procedência, ordena-as na régua de protocolo e escreve sua conclusão.
FIRST VIEWPORT: A cena ocupa a mesa; a pasta manila do caderno à direita; a régua de protocolo da linha do tempo no rodapé; ação principal: examinar objetos.
FORM: Repartição datilografada, posição 6 da lista própria, seed c7c5728c.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${courierPrime.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: `<!--${directionContract}-->` }} />
        {children}
      </body>
    </html>
  );
}
