import type { PrivateCase, PublicCase } from "./schema";

/**
 * Verificações de coerência entre o arquivo público e o privado de um caso.
 * Cobrem os critérios editoriais do PRD (§7) que dá para checar mecanicamente.
 * Devolve a lista de problemas; lista vazia = caso coerente.
 */
export function checkCaseBundle(pub: PublicCase, priv: PrivateCase): string[] {
  const problems: string[] = [];
  const evidenceIds = new Set(pub.evidence.map((e) => e.id));
  const objectIds = new Set<string>();
  const sceneIds = new Set(pub.scenes.map((s) => s.id));

  const dupes = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);
  for (const d of dupes(pub.evidence.map((e) => e.id))) problems.push(`evidência duplicada: ${d}`);
  for (const d of dupes(pub.evidence.map((e) => e.code))) problems.push(`código de procedência duplicado: ${d}`);
  for (const d of dupes(pub.scenes.map((s) => s.id))) problems.push(`cena duplicada: ${d}`);

  if (!sceneIds.has(pub.startSceneId)) problems.push(`cena inicial inexistente: ${pub.startSceneId}`);

  const collectable = new Set<string>();
  for (const scene of pub.scenes) {
    for (const obj of scene.objects) {
      if (objectIds.has(obj.id)) problems.push(`objeto duplicado: ${obj.id}`);
      objectIds.add(obj.id);
    }
  }
  for (const scene of pub.scenes) {
    for (const obj of scene.objects) {
      const where = `${scene.id}/${obj.id}`;
      if (obj.evidenceId) {
        if (!evidenceIds.has(obj.evidenceId)) problems.push(`${where}: evidência inexistente ${obj.evidenceId}`);
        collectable.add(obj.evidenceId);
      }
      if (obj.type === "evidence" && !obj.evidenceId) problems.push(`${where}: objeto de evidência sem evidenceId`);
      if (obj.type === "locked") {
        if (!obj.unlock) problems.push(`${where}: objeto bloqueado sem condição de desbloqueio`);
        const requires = obj.unlock && "requiresExamined" in obj.unlock ? obj.unlock.requiresExamined : [];
        for (const req of requires) {
          if (!objectIds.has(req)) problems.push(`${where}: desbloqueio depende de objeto inexistente ${req}`);
        }
      }
      if (obj.unlock && "code" in obj.unlock && !priv.codes?.[obj.id]) problems.push(`${where}: cadeado sem código`);
      if ((obj.type === "reading" || obj.type === "context") && !obj.content) {
        problems.push(`${where}: objeto de ${obj.type} sem conteúdo`);
      }
    }
  }
  for (const e of pub.evidence) {
    if (!collectable.has(e.id)) problems.push(`evidência ${e.id} não pode ser encontrada em nenhuma cena`);
  }

  if (pub.epochGuess && priv.epochAnswer === undefined) problems.push("epochGuess sem epochAnswer");
  if (pub.epochGuess && priv.epochAnswer !== undefined && priv.epochAnswer >= pub.epochGuess.options.length) {
    problems.push("epochAnswer fora das opções");
  }
  for (const e of pub.evidence) {
    if (!e.quiz) continue;
    const answer = priv.quizAnswers?.[e.id];
    if (!answer) problems.push(`${e.id}: pergunta sem resposta`);
    else if (answer.correct >= e.quiz.options.length) problems.push(`${e.id}: resposta da pergunta fora das opções`);
  }

  const choiceIds = pub.conclusion.choices.map((c) => c.id);
  for (const d of dupes(choiceIds)) problems.push(`alternativa duplicada: ${d}`);
  if (!choiceIds.includes(priv.choiceAnswer.correctId)) problems.push("alternativa certa inexistente");
  for (const cid of choiceIds) {
    if (cid !== priv.choiceAnswer.correctId && !priv.choiceAnswer.wrongFeedback[cid]) {
      problems.push(`alternativa ${cid} sem feedback`);
    }
  }

  const refById = new Map(priv.timelineReference.map((r) => [r.evidenceId, r]));
  for (const e of pub.evidence) {
    const ref = refById.get(e.id);
    if (!ref) {
      problems.push(`evidência ${e.id} sem entrada na linha do tempo de referência`);
      continue;
    }
    if (ref.belongsToStory && ref.referenceOrder === null) problems.push(`${e.id}: pertence à história mas não tem ordem`);
    if (!ref.belongsToStory && ref.referenceOrder !== null) problems.push(`${e.id}: fora da história não deve ter ordem`);
    if (!ref.belongsToStory && !ref.outsideReason) problems.push(`${e.id}: falta explicar por que não pertence à história`);
    if (!ref.belongsToStory && ref.isKeyMilestone) problems.push(`${e.id}: carta fora da história não pode ser marco-chave`);
    if (ref.belongsToStory && !e.date && !ref.datingClueExplanation) {
      problems.push(`${e.id}: carta sem data precisa de explicação dos indícios de datação`);
    }
  }
  for (const r of priv.timelineReference) {
    if (!evidenceIds.has(r.evidenceId)) problems.push(`referência a evidência inexistente: ${r.evidenceId}`);
  }

  const milestones = priv.timelineReference.filter((r) => r.isKeyMilestone);
  if (milestones.length < 2 || milestones.length > 4) {
    problems.push(`o caso deve ter de 2 a 4 marcos-chave (tem ${milestones.length})`);
  }
  const milestoneOrders = milestones.map((m) => m.referenceOrder);
  if (new Set(milestoneOrders).size !== milestoneOrders.length) {
    problems.push("marcos-chave precisam ter uma única ordem defensável (nenhum empate entre eles)");
  }

  const milestoneIds = new Set(milestones.map((m) => m.evidenceId));
  for (const h of priv.timelineHints) {
    if (h.condition.type === "milestones_inverted") {
      for (const p of h.condition.pair) {
        if (!milestoneIds.has(p)) problems.push(`dica cita ${p}, que não é marco-chave`);
      }
    }
  }
  if (!priv.timelineHints.some((h) => h.condition.type === "default")) {
    problems.push("o caso precisa de ao menos uma dica com condição default");
  }

  for (const rel of priv.evidenceRelations) {
    if (!evidenceIds.has(rel.from) || !evidenceIds.has(rel.to)) {
      problems.push(`relação com evidência inexistente: ${rel.from} → ${rel.to}`);
    }
  }

  const belonging = priv.timelineReference.filter((r) => r.belongsToStory).length;
  if (pub.minCardsToResolve > belonging) {
    problems.push(`minCardsToResolve (${pub.minCardsToResolve}) maior que o número de cartas da história (${belonging})`);
  }

  const groupIds = new Set(priv.solution.conceptGroups.map((g) => g.id));
  if (priv.solution.minGroupsToAccept > groupIds.size) {
    problems.push("minGroupsToAccept maior que o número de grupos de conceitos");
  }
  for (const p of priv.solution.partialAnswers) {
    for (const g of p.requiredGroups) {
      if (!groupIds.has(g)) problems.push(`resposta parcial cita grupo inexistente: ${g}`);
    }
  }

  return problems;
}
