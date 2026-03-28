import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { Phase, SessionData } from "./session.types"
import { SessionIntro, SessionLoading } from "./SessionIntro"
import { GrammarPhase, GrammarResultPhase, FillPhase, FillResultPhase } from "./SessionGrammarFill"
import { WritingPhase, WritingResultPhase, ReadingPhase, DonePhase } from "./SessionWritingReading"

const TUTOR_URL = "https://functions.poehali.dev/4a85afed-2998-4c9e-8b88-4bde2ff0c09f"
const INTRO_SECONDS = 5 * 60

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

  const handleRestart = () => {
    setPhase("intro")
    setTimeLeft(INTRO_SECONDS)
    setSession(null)
    setGrammarAnswers([])
    setGrammarResult(null)
    setFillAnswers([])
    setFillResult(null)
    setWritingText("")
    setWritingResult(null)
  }

  const progress = ((INTRO_SECONDS - timeLeft) / INTRO_SECONDS) * 100

  const phaseIndex: Record<Phase, number> = {
    intro: 0, loading: 0,
    grammar: 1, "grammar-result": 1,
    fill: 2, "fill-result": 2,
    writing: 3, "writing-result": 3,
    reading: 4, done: 4,
  }
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

          {phase === "intro" && (
            <SessionIntro timeLeft={timeLeft} progress={progress} error={error} onSkip={skipIntro} />
          )}

          {phase === "loading" && (
            <SessionLoading />
          )}

          {phase === "grammar" && session && (
            <GrammarPhase
              session={session}
              grammarAnswers={grammarAnswers}
              evaluating={evaluating}
              onAnswer={(qi, oi) => {
                const next = [...grammarAnswers]
                next[qi] = oi
                setGrammarAnswers(next)
              }}
              onSubmit={submitGrammar}
            />
          )}

          {phase === "grammar-result" && grammarResult && session && (
            <GrammarResultPhase
              session={session}
              grammarResult={grammarResult}
              onNext={() => setPhase("fill")}
            />
          )}

          {phase === "fill" && session && (
            <FillPhase
              session={session}
              fillAnswers={fillAnswers}
              evaluating={evaluating}
              onAnswer={(ei, value) => {
                const next = [...fillAnswers]
                next[ei] = value
                setFillAnswers(next)
              }}
              onSubmit={submitFill}
            />
          )}

          {phase === "fill-result" && fillResult && session && (
            <FillResultPhase
              session={session}
              fillResult={fillResult}
              onNext={() => setPhase("writing")}
            />
          )}

          {phase === "writing" && session && (
            <WritingPhase
              session={session}
              writingText={writingText}
              evaluating={evaluating}
              onChange={setWritingText}
              onSubmit={submitWriting}
            />
          )}

          {phase === "writing-result" && writingResult && session && (
            <WritingResultPhase
              writingResult={writingResult}
              onNext={() => setPhase("reading")}
            />
          )}

          {phase === "reading" && session && (
            <ReadingPhase
              session={session}
              onNext={() => setPhase("done")}
            />
          )}

          {phase === "done" && (
            <DonePhase
              grammarResult={grammarResult}
              fillResult={fillResult}
              writingResult={writingResult}
              onRestart={handleRestart}
              onHome={() => navigate("/")}
            />
          )}

        </div>
      </div>
    </div>
  )
}
