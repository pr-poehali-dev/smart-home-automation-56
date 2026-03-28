import Icon from "@/components/ui/icon"
import type { Phase, SessionData } from "./session.types"

interface GrammarPhaseProps {
  session: SessionData
  grammarAnswers: number[]
  evaluating: boolean
  onAnswer: (qi: number, oi: number) => void
  onSubmit: () => void
}

export function GrammarPhase({ session, grammarAnswers, evaluating, onAnswer, onSubmit }: GrammarPhaseProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="font-serif text-5xl text-stone/40">01</span>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta">Часть первая</p>
          <h2 className="font-serif text-3xl text-foreground">Грамматика</h2>
        </div>
      </div>
      <div className="space-y-8">
        {session.grammar.questions.map((q, qi) => (
          <div key={q.id} className="border-t border-border pt-6">
            <p className="text-foreground mb-4 leading-relaxed">
              <span className="text-muted-foreground text-sm mr-2">{qi + 1}.</span>
              {q.question}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => onAnswer(qi, oi)}
                  className={`px-4 py-3 text-sm text-left border transition-all duration-300 ${
                    grammarAnswers[qi] === oi
                      ? "border-sage bg-sage/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-sage/50 hover:text-foreground"
                  }`}
                >
                  <span className="text-muted-foreground mr-2 font-mono">{String.fromCharCode(97 + oi)})</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={grammarAnswers.some((a) => a === -1) || evaluating}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {evaluating ? "Проверяю..." : "Проверить ответы"}
          {!evaluating && <Icon name="ArrowRight" size={16} />}
        </button>
      </div>
    </div>
  )
}

interface GrammarResultPhaseProps {
  session: SessionData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grammarResult: any
  onNext: () => void
}

export function GrammarResultPhase({ session, grammarResult, onNext }: GrammarResultPhaseProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="font-serif text-5xl text-stone/40">01</span>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta">Результат</p>
          <h2 className="font-serif text-3xl text-foreground">Грамматика</h2>
        </div>
      </div>

      <div className="bg-sand/50 p-6 mb-8 border-l-2 border-sage">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-serif text-5xl text-sage">{grammarResult.score}</span>
          <span className="text-muted-foreground text-lg">/ {grammarResult.total}</span>
          <span className="ml-auto font-serif text-2xl text-terracotta">{grammarResult.percentage}%</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">{grammarResult.feedback}</p>
      </div>

      <div className="space-y-4 mb-8">
        {session.grammar.questions.map((q, qi) => {
          const r = grammarResult.results?.[qi]
          return (
            <div key={q.id} className={`p-4 border-l-2 ${r?.correct ? "border-sage bg-sage/5" : "border-terracotta bg-terracotta/5"}`}>
              <div className="flex items-start gap-2 mb-2">
                <Icon name={r?.correct ? "CheckCircle" : "XCircle"} size={16} className={r?.correct ? "text-sage mt-0.5" : "text-terracotta mt-0.5"} />
                <p className="text-sm text-foreground">{q.question}</p>
              </div>
              {!r?.correct && (
                <p className="text-xs text-muted-foreground ml-6">
                  Правильно: <span className="text-sage">{q.options[q.correct]}</span> — {q.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
        >
          Часть 2: Упражнения
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </div>
  )
}

interface FillPhaseProps {
  session: SessionData
  fillAnswers: string[]
  evaluating: boolean
  onAnswer: (ei: number, value: string) => void
  onSubmit: () => void
}

export function FillPhase({ session, fillAnswers, evaluating, onAnswer, onSubmit }: FillPhaseProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="font-serif text-5xl text-stone/40">02</span>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta">Часть вторая</p>
          <h2 className="font-serif text-3xl text-foreground">Заполните пропуски</h2>
        </div>
      </div>
      <div className="space-y-8">
        {session.fill.exercises.map((ex, ei) => (
          <div key={ex.id} className="border-t border-border pt-6">
            <p className="text-foreground mb-2 leading-relaxed">
              <span className="text-muted-foreground text-sm mr-2">{ei + 1}.</span>
              {ex.sentence}
            </p>
            <p className="text-xs text-muted-foreground mb-3 tracking-wide">{ex.hint}</p>
            <input
              type="text"
              value={fillAnswers[ei] || ""}
              onChange={(e) => onAnswer(ei, e.target.value)}
              placeholder="Ваш ответ..."
              className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder:text-muted-foreground/40 focus:border-sage focus:outline-none transition-colors"
            />
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={fillAnswers.some((a) => !a.trim()) || evaluating}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {evaluating ? "Проверяю..." : "Проверить"}
          {!evaluating && <Icon name="ArrowRight" size={16} />}
        </button>
      </div>
    </div>
  )
}

interface FillResultPhaseProps {
  session: SessionData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillResult: any
  onNext: () => void
}

export function FillResultPhase({ session, fillResult, onNext }: FillResultPhaseProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="font-serif text-5xl text-stone/40">02</span>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta">Результат</p>
          <h2 className="font-serif text-3xl text-foreground">Упражнения</h2>
        </div>
      </div>

      <div className="bg-sand/50 p-6 mb-8 border-l-2 border-sage">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-serif text-5xl text-sage">{fillResult.score}</span>
          <span className="text-muted-foreground text-lg">/ {fillResult.total}</span>
          <span className="ml-auto font-serif text-2xl text-terracotta">{fillResult.percentage}%</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">{fillResult.feedback}</p>
      </div>

      <div className="space-y-4 mb-8">
        {session.fill.exercises.map((ex, ei) => {
          const r = fillResult.results?.[ei]
          return (
            <div key={ex.id} className={`p-4 border-l-2 ${r?.correct ? "border-sage bg-sage/5" : "border-terracotta bg-terracotta/5"}`}>
              <div className="flex items-start gap-2 mb-1">
                <Icon name={r?.correct ? "CheckCircle" : "XCircle"} size={16} className={r?.correct ? "text-sage mt-0.5" : "text-terracotta mt-0.5"} />
                <p className="text-sm text-foreground">{ex.sentence}</p>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Ваш ответ: <span className={r?.correct ? "text-sage" : "text-terracotta"}>{r?.user_answer || "—"}</span>
                {!r?.correct && <> · Правильно: <span className="text-sage">{r?.correct_answer}</span> — {ex.explanation}</>}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
        >
          Часть 3: Письмо
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </div>
  )
}

export type { Phase }
