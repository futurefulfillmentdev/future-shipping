import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
  title: string
  description?: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section className={cn(
      "bg-black text-white",
      "py-20 px-4",
      className
    )}>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <h2 className="max-w-3xl md:max-w-4xl lg:max-w-5xl text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold leading-tight text-white text-center">
            {title}
          </h2>
          {description && (
            <p className="text-lg max-w-3xl text-gray-300 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:2rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(6)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Gradient fades for smooth edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent" />
        </div>
      </div>
    </section>
  )
} 