import Icon from "@/components/ui/icon"

interface SessionIntroProps {
  timeLeft: number
  progress: number
  error: string
  onSkip: () => void
}

export function SessionIntro({ timeLeft, progress, error, onSkip }: SessionIntroProps) {
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
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
        onClick={onSkip}
        className="inline-flex items-center gap-3 px-8 py-4 bg-sage text-primary-foreground text-sm tracking-widest uppercase hover:bg-sage/90 transition-all duration-500"
      >
        Начать сейчас
        <Icon name="ArrowRight" size={16} />
      </button>
    </div>
  )
}

export function SessionLoading() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      <p className="font-serif text-2xl text-foreground mb-3">Генерирую задания...</p>
      <p className="text-muted-foreground text-sm">Нейросеть готовит персональную сессию</p>
    </div>
  )
}
