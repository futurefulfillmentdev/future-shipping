import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar?: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-2xl glass-morphism",
        "p-6 text-start",
        "hover:border-[#6BE53D]/30 hover:shadow-[#6BE53D]/20",
        "max-w-[380px] sm:max-w-[420px]",
        "transition-all duration-300 hover:scale-[1.02]",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12 border-2 border-[#6BE53D]/30">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="bg-[#6BE53D]/20 text-[#6BE53D] font-semibold">
            {author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-bold text-white leading-none">
            {author.name}
          </h3>
          <p className="text-sm text-[#6BE53D] mt-1">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="text-base text-gray-300 leading-relaxed italic">
        "{text}"
      </p>
    </Card>
  )
} 