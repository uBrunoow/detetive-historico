# Design: noir 16-bit

Aprovado pelo dono em 28/10/2026 a partir do mockup `public/mockup/index.html`. Decisão de jogo correspondente: D21 em `DECISOES.md`.

## Mundo

É noite na cidade e o detetive trabalha. Céu índigo em faixas (como um dither de 16 cores), estrelas, nuvens escuras, chuva e neblina em pixel, chão de pedra molhada e a luz âmbar de um poste. Os documentos são o único papel claro da tela: dossiês em pergaminho com tinta-ameixa. É sério e investigativo, sem ser assustador nem punitivo, para alunos de 11 a 17 anos.

Linhagem: plataformas e aventuras 2D (Mario, Zelda, Celeste, Mega Man, Donkey Kong, Enigma do Medo). A arte é toda original: nada de personagens, cenários ou paletas copiados.

## Cor (`app/globals.css`, `:root`)

| Papel | Token | Valor |
|---|---|---|
| Céu, do topo ao horizonte | `--night-0..3`, `--dusk` | `#0d0b1e` `#17142f` `#261f45` `#3d2a52` `#5a2f4f` |
| Texto sobre a noite | `--bone` / `--mist` | `#f1e6c8` / `#c9bfe0` |
| Ação principal, barbante, carimbo | `--blood` | `#a3202e` |
| Luz, pontos, escolha, foco | `--amber` | `#e8a93a` |
| Dossiê (pergaminho) | `--paper-0..6` | `#f3e9cc` … `#2a2033` |
| Tinta | `--ink` | `#1e1528` |

Um tema só: o noir não inverte no modo escuro. Os nomes antigos (`wood`, `sky`, `manila`, `btn-primary`…) continuam existindo e apontam para os valores do noir. Os pares de texto têm contraste AA garantido por `tests/unit/contrast.test.ts`.

## Tipografia

- **Jersey 10** (`font-pixel`, `font-title`, `.px-title`, botões): títulos, botões, HUD e números. Só tem um peso, sem negrito falso. Abaixo de 17 px, `font-pixel` volta para Atkinson.
- **Jacquard 24** (`.title-gothic`): só no letreiro "Detetive Histórico".
- **Atkinson Hyperlegible Next**: todo texto corrido e rótulos pequenos.
- **Courier Prime e Kalam**: só dentro dos documentos.

## Peças

- `NightSky`: a noite de todas as telas, em duas camadas. O fundo (estrelas, lua, nuvens, morcegos, chão) fica atrás de tudo; a frente (neblina, poças, chuva, relâmpago) passa por cima do cenário e por baixo dos painéis. O conteúdo de cada tela fica em `relative z-10`.
- `.game-world::after`: linhas de varredura e cantos escuros de monitor velho, leves.
- `IrisNav`: ao clicar num link interno, a íris fecha a partir do ponto clicado antes de trocar de página.
- `DetectiveDialog`: a fala do detetive embaixo da cena, datilografada (o leitor de tela recebe a frase inteira).
- `PixelSprite`: sprites em SVG nítido desenhados em `lib/pixel/sprites.ts` (detetive, rosto, poste, lua, estrela, moeda, alfinete, nuvem, pinheiros, prédio do arquivo, cidade).
- Botões `.px-btn`: âmbar (padrão), `.px-btn-ink` vermelho-sangue (ação principal), `.px-btn-paper` pergaminho (navegação). `.px-btn-call` pulsa no botão que é a próxima coisa a fazer.
- Painéis: `bg-paper-0 text-ink px-frame` (moldura pixel com cantos em degrau).
- Blocos de época `.epoch-block`: bloco "?" âmbar que flutua; o escolhido fica claro, com anel vermelho e âmbar, e pula.

## Telas

- **Início**: links no topo e as três lupas, letreiro gótico, "Começar investigação" e "aperte Enter"; a rua do arquivo na chuva com o detetive sob o poste.
- **Fases**: quadro de alfinetes ligados por barbante vermelho sobre a cidade, com o dossiê do caso escolhido; no celular, cards.
- **Cena**: HUD com lupas e moeda; título do lugar; painel "Pistas" com um espaço por fonte; a sala no escuro e a luz que segue o olhar (ponteiro ou foco do teclado); brilhos nos objetos ainda não examinados; a sala acende quando todas as fontes foram encontradas; a fala do detetive embaixo.
- **Veredito**: parte 1, blocos A–E e regras de pontuação à vista; parte 2, a bandeja de pistas e o barbante com uma casa por fonte, "Conferir ordem" e o carimbo "X de Y no lugar".
- **Encerramento**: placar com estrelas entrando uma a uma, total contando, barras de época e ordem, carimbo ("Arquivado", "Resolvido" ou "Em aberto"), o detetive ao lado e os botões do mockup.

## Movimento

Toda tela fecha em íris no clique e abre em íris (`.iris-open`). Movimento ambiente (chuva, estrelas, poste, janelas, morcegos) é decoração do mundo. Movimento de resposta: o bloco pula ao ser escolhido, as cartas caem no barbante, o carimbo desce, as estrelas entram. O "quique" (easing com overshoot) é proposital nesses momentos de jogo. Com "reduzir movimento" (sistema ou Opções), tudo fica parado no estado final. O relâmpago pisca duas vezes a cada 11 s, fraco e abaixo de 3 clarões por segundo.
