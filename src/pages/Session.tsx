import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"

const TUTOR_URL = "https://functions.poehali.dev/4a85afed-2998-4c9e-8b88-4bde2ff0c09f"
const INTRO_SECONDS = 5 * 60

type Phase = "intro" | "loading" | "grammar" | "grammar-result" | "fill" | "fill-result" | "writing" | "writing-result" | "reading" | "done"

interface GrammarQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}
interface FillExercise {
  id: number
  sentence: string
  correct_answer: string
  hint: string
  explanation: string
}
interface WritingTask {
  prompt: string
  min_sentences: number
  max_sentences: number
  tips: string[]
}
interface ReadingTask {
  title: string
  url: string
  description: string
  questions: string[]
}
interface SessionData {
  grammar: { questions: GrammarQuestion[] }
  fill: { exercises: FillExercise[] }
  writing: WritingTask
  reading: ReadingTask
}

export default function Session() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>("intro")
  const [timeLeft, setTimeLeft] = useState(INTRO_SECONDS)
  const [session, setSession] = useState<SessionData | null>(null)
  const [error, setError] = useState("")

  // Grammar state
  const [grammarAnswers, setGrammarAnswers] = useState<number[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [evaluating, setEvaluating] = useState(false)

  // Fill state
  const [fillAnswers, setFillAnswers] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fillResult, setFillResult] = useState<any>(null)

  // Writing state
  const [writingText, setWritingText] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [writingResult, setWritingResult] = useState<any>(null)

  // Timer
  useEffect(() => {
    if (phase !== "intro") return
    if (timeLeft <= 0) {
      setPhase("loading")
      loadSession()
      return
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  const loadSession = useCallback(async () => {
    setError("")
    try {
      const res = await fetch(TUTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_session" }),
      })
      const data = await res.json()
      setSession(data)
      setGrammarAnswers(new Array(data.grammar.questions.length).fill(-1))
      setFillAnswers(new Array(data.fill.exercises.length).fill(""))
      setPhase("grammar")
    } catch {
      setError("Не удалось загрузить сессию. Проверьте API ключ и попробуйте снова.")
      setPhase("intro")
    }
  }, [])

  const skipIntro = () => {
    setTimeLeft(0)
    setPhase("loading")
    loadSession()
  }

  const submitGrammar = async () => {
    if (!session) return
    setEvaluating(true)
    try {
      const res = await fetch(TUTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_grammar", answers: grammarAnswers, questions: session.grammar.questions }),
      })
      setGrammarResult(await res.json())
      setPhase("grammar-result")
    } finally {
      setEvaluating(false)
    }
  }

  const submitFill = async () => {
    if (!session) return
    setEvaluating(true)
    try {
      const res = await fetch(TUTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_fill", answers: fillAnswers, exercises: session.fill.exercises }),
      })
      setFillResult(await res.json())
      setPhase("fill-result")
    } finally {
      setEvaluating(false)
    }
  }

  const submitWriting = async () => {
    if (!session || !writingText.trim()) return
    setEvaluating(true)
    try {
      const res = await fetch(TUTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate_writing", text: writingText, prompt: session.writing.prompt }),
      })
      setWritingResult(await res.json())
      setPhase("writing-result")
    } finally {
      setEvaluating(false)
    }
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const progress = ((INTRO_SECONDS - timeLeft) / INTRO_SECONDS) * 100

  const phaseIndex = { intro: 0, loading: 0, grammar: 1, "grammar-result": 1, fill: 2, "fill-result": 2, writing: 3, "writing-result": 3, reading: 4, done: 4 }
  const currentStep = phaseIndex[phase] || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="font-serif text-xl text-foreground hover:text-sage transition-colors">
            LinguaAI
          </button>
          {phase !== "intro" && phase !== "loading" && (
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`w-8 h-1 rounded-full transition-colors duration-500 ${s <= currentStep ? "bg-sage" : "bg-border"}`} />
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="pt-16 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">

          {/* INTRO PHASE */}
          {phase === "intro" && (
            <div className="text-center">
              <p className="text-xs tracking-[0.3em] uppercase text-terracotta mb-6">Подготовка</p>
              <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">
                Сессия начнётся через
              </h1>
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="hsl(var(--sage))" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-4xl text-foreground">{mins}:{secs.toString().padStart(2, "0")}</span>
                  <span className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">минут</span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
                Используйте это время, чтобы настроиться. Возьмите чай, закройте лишние вкладки — впереди 4 части сессии.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 text-sm text-muted-foreground">
                {["01 · Грамматика", "02 · Упражнения", "03 · Письмо", "04 · Чтение"].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage/50" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              {error && <p className="text-destructive text-sm mb-4">{error}</p>}
              <button
                onClick={skipIntro}
                className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
              >
                Начать сейчас
                <Icon name="ArrowRight" size={16} />
              </button>
            </div>
          )}

          {/* LOADING */}
          {phase === "loading" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
              <p className="font-serif text-2xl text-foreground mb-3">Генерирую задания...</p>
              <p className="text-muted-foreground text-sm">Нейросеть готовит персональную сессию</p>
            </div>
          )}

          {/* GRAMMAR PHASE */}
          {phase === "grammar" && session && (
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
                          onClick={() => {
                            const next = [...grammarAnswers]
                            next[qi] = oi
                            setGrammarAnswers(next)
                          }}
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
                  onClick={submitGrammar}
                  disabled={grammarAnswers.some((a) => a === -1) || evaluating}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {evaluating ? "Проверяю..." : "Проверить ответы"}
                  {!evaluating && <Icon name="ArrowRight" size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* GRAMMAR RESULT */}
          {phase === "grammar-result" && grammarResult && session && (
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
                  onClick={() => setPhase("fill")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
                >
                  Часть 2: Упражнения
                  <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* FILL PHASE */}
          {phase === "fill" && session && (
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
                      onChange={(e) => {
                        const next = [...fillAnswers]
                        next[ei] = e.target.value
                        setFillAnswers(next)
                      }}
                      placeholder="Ваш ответ..."
                      className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder:text-muted-foreground/40 focus:border-sage focus:outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-10 flex justify-end">
                <button
                  onClick={submitFill}
                  disabled={fillAnswers.some((a) => !a.trim()) || evaluating}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {evaluating ? "Проверяю..." : "Проверить"}
                  {!evaluating && <Icon name="ArrowRight" size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* FILL RESULT */}
          {phase === "fill-result" && fillResult && session && (
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
                  onClick={() => setPhase("writing")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
                >
                  Часть 3: Письмо
                  <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* WRITING PHASE */}
          {phase === "writing" && session && (
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
                onChange={(e) => setWritingText(e.target.value)}
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
                  onClick={submitWriting}
                  disabled={writingText.trim().length < 20 || evaluating}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {evaluating ? "Нейросеть оценивает..." : "Отправить на проверку"}
                  {!evaluating && <Icon name="ArrowRight" size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* WRITING RESULT */}
          {phase === "writing-result" && writingResult && session && (
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
                  onClick={() => setPhase("reading")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
                >
                  Часть 4: Чтение
                  <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* READING PHASE */}
          {phase === "reading" && session && (
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
                  onClick={() => setPhase("done")}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
                >
                  Завершить сессию
                  <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* DONE */}
          {phase === "done" && (
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
                  onClick={() => {
                    setPhase("intro")
                    setTimeLeft(INTRO_SECONDS)
                    setSession(null)
                    setGrammarAnswers([])
                    setGrammarResult(null)
                    setFillAnswers([])
                    setFillResult(null)
                    setWritingText("")
                    setWritingResult(null)
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
                >
                  Новая сессия
                  <Icon name="RefreshCw" size={16} />
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-3 px-8 py-4 text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  На главную
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}