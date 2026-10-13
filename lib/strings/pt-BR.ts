/**
 * Textos da interface em português do Brasil, num só lugar para facilitar a
 * revisão pedagógica. Textos de casos ficam nos arquivos de cada caso.
 */
export const strings = {
  app: {
    name: "Detetive Histórico",
    description: "Investigue fontes, reconstrua a ordem dos acontecimentos e explique o que aconteceu.",
  },
  catalog: {
    heading: "Casos em aberto",
    empty: "Nenhum caso publicado ainda. Os casos entram como arquivos em content/cases/.",
    fictional: "Conteúdo fictício para testes",
    period: "Período",
    place: "Local",
    duration: (min: number) => `cerca de ${min} minutos`,
    difficulty: { easy: "Fácil", medium: "Média", hard: "Difícil" },
    status: {
      not_started: "Não iniciado",
      in_progress: "Em andamento",
      solved: "Concluído",
      failed: "Concluído",
    },
  },
} as const;
