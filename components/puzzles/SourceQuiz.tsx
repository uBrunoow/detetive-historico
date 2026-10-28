"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Quiz } from "@/lib/content/schema";

export function SourceQuiz({ quiz, answered, onAnswer, onLater }: {
  quiz: Quiz;
  answered: boolean;
  onAnswer: (index: number) => Promise<{ correct: boolean; explanation: string }>;
  onLater: () => void;
}) {
  const [result, setResult] = useState<{ correct: boolean; explanation: string }>();
  if (answered && !result) return <p role="status" className="mt-4 text-sm text-stamp">Pergunta respondida.</p>;
  return (
    <section aria-labelledby="source-quiz" className="mt-5 border-t border-dashed border-paper-4 pt-4">
      <h3 id="source-quiz" className="font-pixel font-bold">{quiz.question}</h3>
      <div className="mt-3 grid gap-2">
        {quiz.options.map((option, index) => (
          <Button key={option} variant="secondary" disabled={Boolean(result)} onClick={async () => setResult(await onAnswer(index))}>
            {option}
          </Button>
        ))}
      </div>
      {result ? (
        <div role="status" aria-live="polite" className="mt-3">
          <p className="font-semibold">{result.correct ? "Certo! +25" : "Ainda não."}</p>
          <p className="text-sm">{result.explanation}</p>
        </div>
      ) : (
        <Button variant="secondary" className="mt-3" onClick={onLater}>Agora não</Button>
      )}
    </section>
  );
}
