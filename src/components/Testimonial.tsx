import { useEffect, useRef, useState } from "react"

export function Testimonial() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 lg:py-40 px-6 lg:px-12 bg-sage">
      <div className="max-w-5xl mx-auto text-center">
        {/* Quote Mark */}
        <div
          className={`mb-10 transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
          <svg className="w-16 h-16 mx-auto text-primary-foreground/30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>

        {/* Quote */}
        <blockquote
          className={`font-serif text-2xl md:text-3xl lg:text-4xl font-light text-primary-foreground leading-relaxed mb-10 text-balance transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Работа с Wabi была похожа на медитацию. Они поняли, что наш дом должен поддерживать
          благополучие семьи, а не просто красиво выглядеть. Результат — пространство, которое наконец ощущается как наше.
        </blockquote>

        {/* Attribution */}
        <div
          className={`transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-sm tracking-widest uppercase text-primary-foreground/80">Анна и Михаил Петровы</p>
          <p className="text-sm text-primary-foreground/60 mt-1">Резиденция в Москве</p>
        </div>
      </div>
    </section>
  )
}
