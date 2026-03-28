export type Phase =
  | "intro"
  | "loading"
  | "grammar"
  | "grammar-result"
  | "fill"
  | "fill-result"
  | "writing"
  | "writing-result"
  | "reading"
  | "done"

export interface GrammarQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface FillExercise {
  id: number
  sentence: string
  correct_answer: string
  hint: string
  explanation: string
}

export interface WritingTask {
  prompt: string
  min_sentences: number
  max_sentences: number
  tips: string[]
}

export interface ReadingTask {
  title: string
  url: string
  description: string
  questions: string[]
}

export interface SessionData {
  grammar: { questions: GrammarQuestion[] }
  fill: { exercises: FillExercise[] }
  writing: WritingTask
  reading: ReadingTask
}
