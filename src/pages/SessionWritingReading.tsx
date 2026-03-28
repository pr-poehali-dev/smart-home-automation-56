import Icon from "@/components/ui/icon"
import type { SessionData } from "./session.types"

interface WritingPhaseProps {
  session: SessionData
  writingText: string
  evaluating: boolean
  onChange: (text: string) => void
  onSubmit: () => void
}

export function WritingPhase({ session, writingText, evaluating, onChange, onSubmit }: WritingPhaseProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="font-serif text-5xl text-stone/40">03</span>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta">Часть третья</p>
          <h2 className="font-serif text-3xl text-foreground">Письмо</h2>
        </div>
      </div>

      <div className="bg-sand/50 p-6 mb-6 border-l-2 border-terracotta">
        <p className="text-foreground leading-relaxed mb-4">{session.writing.prompt}</p>
        <p className="text-xs text-muted-foreground tracking-wide">
          {session.writing.min_sentences}–{session.writing.max_sentences} предложений
        </p>
      </div>

      {session.writing.tips.length > 0 && (
        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Подсказки</p>
          <ul className="space-y-1">
            {session.writing.tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-sage">·</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <textarea
        value={writingText}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Write your answer in English here..."
        className="w-full bg-transparent border border-border p-4 text-foreground placeholder:text-muted-foreground/40 focus:border-sage focus:outline-none transition-colors resize-none leading-relaxed"
      />
      <div className="flex items-center justify-between mt-3 mb-8">
        <p className="text-xs text-muted-foreground">
          {writingText.trim().split(/\s+/).filter(Boolean).length} слов
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={writingText.trim().length < 20 || evaluating}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {evaluating ? "Нейросеть оценивает..." : "Отправить на проверку"}
          {!evaluating && <Icon name="ArrowRight" size={16} />}
        </button>
      </div>
    </div>
  )
}

interface WritingResultPhaseProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writingResult: any
  onNext: () => void
}

export function WritingResultPhase({ writingResult, onNext }: WritingResultPhaseProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="font-serif text-5xl text-stone/40">03</span>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta">Оценка AI</p>
          <h2 className="font-serif text-3xl text-foreground">Письмо</h2>
        </div>
      </div>

      <div className="bg-sand/50 p-6 mb-8 border-l-2 border-sage">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-serif text-5xl text-sage">{writingResult.score}</span>
          <span className="text-muted-foreground text-lg">/ {writingResult.max_score}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          {[
            { label: "Грамматика", val: writingResult.grammar_score },
            { label: "Лексика", val: writingResult.vocabulary_score },
            { label: "Содержание", val: writingResult.content_score },
          ].map((item) => (
            <div key={item.label} className="bg-background p-3">
              <p className="font-serif text-2xl text-sage">{item.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed">{writingResult.feedback_ru}</p>
      </div>

      {writingResult.corrections?.length > 0 && (
        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Исправления</p>
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {writingResult.corrections.map((c: any, i: number) => (
              <div key={i} className="p-4 border-l-2 border-terracotta bg-terracotta/5">
                <p className="text-sm">
                  <span className="line-through text-muted-foreground">{c.original}</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <span className="text-sage">{c.corrected}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{c.explanation_ru}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {writingResult.strengths_ru?.length > 0 && (
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Что хорошо</p>
          <ul className="space-y-1">
            {writingResult.strengths_ru.map((s: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-sage">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
        >
          Часть 4: Чтение
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </div>
  )
}

interface ReadingPhaseProps {
  session: SessionData
  onNext: () => void
}

export function ReadingPhase({ session, onNext }: ReadingPhaseProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <span className="font-serif text-5xl text-stone/40">04</span>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-terracotta">Часть четвёртая</p>
          <h2 className="font-serif text-3xl text-foreground">Чтение</h2>
        </div>
      </div>

      <div className="bg-sand/50 p-6 mb-6 border-l-2 border-sage">
        <h3 className="font-serif text-xl text-foreground mb-2">{session.reading.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{session.reading.description}</p>
        <a
          href={session.reading.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage/80 transition-colors tracking-wide"
        >
          Открыть текст
          <Icon name="ExternalLink" size={14} />
        </a>
      </div>

      {session.reading.questions.length > 0 && (
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Вопросы для понимания</p>
          <div className="space-y-3">
            {session.reading.questions.map((q, i) => (
              <div key={i} className="flex gap-3 text-sm text-muted-foreground border-t border-border pt-3">
                <span className="text-sage font-mono">{i + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
        >
          Завершить сессию
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>
    </div>
  )
}

interface DonePhaseProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grammarResult: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fillResult: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writingResult: any
  onRestart: () => void
  onHome: () => void
}

export function DonePhase({ grammarResult, fillResult, writingResult, onRestart, onHome }: DonePhaseProps) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-8 bg-sage/10 rounded-full flex items-center justify-center">
        <Icon name="Trophy" size={36} className="text-sage" />
      </div>
      <p className="text-xs tracking-[0.3em] uppercase text-terracotta mb-4">Сессия завершена</p>
      <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">
        Отличная работа!
      </h1>
      <p className="text-muted-foreground leading-relaxed max-w-md mx-auto mb-10">
        Вы прошли все 4 части — грамматику, упражнения, письмо и чтение. Каждая сессия делает вас увереннее.
      </p>

      <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mb-10 border-t border-b border-border py-8">
        {[
          { label: "Грамматика", val: grammarResult ? `${grammarResult.percentage}%` : "—" },
          { label: "Упражнения", val: fillResult ? `${fillResult.percentage}%` : "—" },
          { label: "Письмо", val: writingResult ? `${writingResult.score}/${writingResult.max_score}` : "—" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-serif text-2xl text-sage">{s.val}</p>
            <p className="text-xs text-muted-foreground mt-1 tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
        >
          Новая сессия
          <Icon name="RefreshCw" size={16} />
        </button>
        <button
          onClick={onHome}
          className="inline-flex items-center gap-3 px-8 py-4 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  )
}
