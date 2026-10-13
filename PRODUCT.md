# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + React + TypeScript strict + Tailwind CSS. Sem banco de dados no MVP: casos são arquivos versionados no repositório (a parte que revela a solução só é lida no servidor) e o progresso do jogador fica no navegador. Deploy previsto na Vercel.

## Users

Estudantes dos anos finais do Ensino Fundamental e do Ensino Médio (aprox. 11 a 17 anos), jogando principalmente em **laboratório de informática da escola**: computadores e Chromebooks modestos, telas pequenas, às vezes conexão lenta, com o professor por perto. Também precisa funcionar em tablet e celular. Como o público mistura as duas faixas, a linguagem segue a faixa mais nova.

Professores usam os casos como recurso didático (painel do professor fora do MVP).

## Purpose

Jogo web 2D de investigação histórica. O jogador explora uma cena ilustrada, coleta evidências que viram cartas, reconstrói a ordem dos acontecimentos numa linha do tempo (com grau de certeza, justificativas e ligações de causa e consequência) e escreve uma conclusão em texto livre, com até 5 tentativas. No fim, vê a solução comentada e a linha do tempo de referência comparada à sua.

Diferencial: não é quiz. A resposta depende de interpretar fontes e de situar no tempo cartas sem data; o jogo nunca decide pelo jogador nem aponta qual carta está errada.

## Constraints

- Nada que revele a solução chega ao navegador antes do encerramento do caso.
- Acessibilidade é requisito do MVP: linha do tempo montável só com teclado/botões, anúncios para leitor de tela, estados nunca só por cor, alvos de toque ≥ 44 px, contraste WCAG AA.
- Casos são dados: um caso novo entra sem alterar componentes.
- Distinguir sempre fonte, inferência e ficção; casos fictícios são identificados como tal.
- Interface em português do Brasil, textos centralizados para revisão pedagógica.

## Voice

Acolhedora e investigativa, nunca punitiva: o erro é parte da investigação ("revise", "observe", nunca "você falhou"). Frases curtas e diretas para alunos de 11 anos.

## Brand

Nome: Detetive Histórico. **Em aberto:** se haverá marca da UDESC e qual será o logotipo do software — reservar espaço para créditos institucionais e logotipo sem depender deles.

## References

Jogos analisados no trabalho acadêmico do projeto: Carmen Sandiego no Google Earth, Assassin's Creed: Discovery Tour, Mission US; trabalhos correlatos Museu Sankofa (UFSC), Turista do Tempo (IFRN), Tríade (UNEB).
