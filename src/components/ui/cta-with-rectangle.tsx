"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

interface CTAProps {
  badge?: {
    text: string
  }
  title: string
  description?: string
  action: {
    text: string
    href?: string
    onClick?: () => void
  }
  withGlow?: boolean
  className?: string
}

export function CTASection({
  badge,
  title,
  description,
  action,
  withGlow = true,
  className,
}: CTAProps) {
  return (
    <section className={cn("bg-black py-20 px-6 sm:px-8", className)}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="relative glass-morphism p-12 md:p-16 rounded-3xl text-center animate-pulse-border"
        >
          {/* Brand green glow effect */}
          {withGlow && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#6BE53D]/10 via-transparent to-[#6BE53D]/10 rounded-3xl pointer-events-none" />
          )}

          <div className="relative z-10 space-y-6">
            {/* Badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <Badge
                  variant="outline"
                  className="border-[#6BE53D]/30 bg-[#6BE53D]/10 text-[#6BE53D] hover:bg-[#6BE53D]/20"
                >
                  {badge.text}
                </Badge>
              </motion.div>
            )}

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
            >
              {title}
            </motion.h2>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
              >
                {description}
              </motion.p>
            )}

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              {action.href ? (
                <div>
                  <Link href={action.href}>
                    <button className="liquid-button text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 rounded-full">
                      <span className="sm:hidden">Get Started</span>
                      <span className="hidden sm:inline">{action.text}</span>
                    </button>
                  </Link>
                  <div className="sm:hidden mt-2">
                    <span className="text-xs font-normal" style={{ color: '#6BE53D' }}>100% Free</span>
                  </div>
                </div>
              ) : (
                <div>
                  <button 
                    onClick={action.onClick}
                    className="liquid-button text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 rounded-full"
                  >
                    <span className="sm:hidden">Get Started</span>
                    <span className="hidden sm:inline">{action.text}</span>
                  </button>
                  <div className="sm:hidden mt-2">
                    <span className="text-xs font-normal" style={{ color: '#6BE53D' }}>100% Free</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 