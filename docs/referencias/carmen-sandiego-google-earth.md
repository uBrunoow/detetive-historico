# Referência: Carmen Sandiego no Google Earth (2019)

Estudo de padrões de interação feito em 13/10/2026 para inspirar o Detetive Histórico. **Só padrões, nada de marca, texto ou arte.**

**Grau de evidência:** a análise direta com a ferramenta REA falhou (o Google Earth web é um app Flutter/WebGL em canvas, e o WebGL não carrega sem GPU); a série parece descontinuada. O que segue vem de fontes secundárias: blog do Google, Kotaku, Time, TheNextWeb, Engadget, Game Informer, Wikipedia.

## Como funciona

Briefing curto em formato de despacho → em cada cidade, um cartão de contexto e três pontos nomeados com testemunhas que dão pistas indiretas (bandeira, moeda, idioma) → múltipla escolha do próximo destino; errar custa só um desvio curto e narrativo → captura e fecho em cerca de 30 minutos.

## Padrões adotados ou planejados

| Padrão | Onde no Detetive Histórico | Situação |
| --- | --- | --- |
| Briefing como despacho, missão antes da mecânica | Briefing em papel timbrado com carimbo | Fase 1 |
| Poucos pontos de interesse, todos nomeados, percorríveis por lista | Rótulos nos hotspots + lista "O que dá para examinar" (rota de teclado/leitor de tela) | Fase 1 |
| Recompensa breve pela ação (não pelo acerto) | Carimbo "Arquivado" ao guardar a fonte, anunciado por `aria-live` | Fase 1 |
| Rever sem punição, sem cronômetro | Toda carta reabre a fonte original | Fase 2 |
| Cartão de contexto na chegada ao lugar | Ficha "Local / Época" ao entrar numa cena | Avaliar |
| Transição do geral para o detalhe | Zoom do hotspot até o documento (corte simples com movimento reduzido) | Avaliar |
| Erro leve e narrativo | "Parecer do arquivista" na conferência, sem apontar carta | Fase 4 |
| Ritual antes do ato final | Formulário "Relatório final" em papel timbrado | Fase 4 |
| Fecho narrativo | "Processo arquivado" com carimbo "Caso encerrado" | Fase 5 |

## O que não copiar

- Conteúdo em canvas sem semântica: usamos DOM real, botões e `<dialog>`.
- Múltipla escolha com certo/errado imediato: a conclusão é texto livre e a linha do tempo nunca diz qual carta está errada.
- Pistas que praticamente entregam a resposta: as dicas apontam o método, não o conteúdo.
- Animações obrigatórias sem opção de pular; informação só visual sem texto equivalente.
- Ausência total de som foi criticada: se houver som, discreto, desligável e nunca o único portador de informação.

Fontes: blog.google/products/earth/carmen-sandiego-back-final-assignment-google-earth · kotaku.com/where-on-google-earth-is-carmen-sandiego-1833268118 · time.com/5549687/carmen-sandiego-google-earth · engadget.com/2019-03-13-google-earth-carmen-sandiego-video-game.html · en.wikipedia.org/wiki/Where_on_Google_Earth_is_Carmen_Sandiego%3F
