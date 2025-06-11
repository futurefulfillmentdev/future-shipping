"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon?: string;
  iconPosition?: "left" | "right";
}

interface FaqAccordionProps {
  data: FAQItem[];
  className?: string;
  timestamp?: string;
  questionClassName?: string;
  answerClassName?: string;
}

export function FaqAccordion({
  data,
  className,
  timestamp,
  questionClassName,
  answerClassName,
}: FaqAccordionProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <div className={cn("p-4", className)}>
      {timestamp && (
        <div className="mb-4 text-sm text-gray-400">{timestamp}</div>
      )}

      <Accordion.Root
        type="single"
        collapsible
        value={openItem || ""}
        onValueChange={(value) => setOpenItem(value)}
      >
        {data.map((item) => (
          <Accordion.Item 
            value={item.id.toString()} 
            key={item.id} 
            className="mb-6"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-between gap-x-4 group">
                <div
                  className={cn(
                    "relative flex items-center space-x-3 rounded-xl p-4 transition-all duration-300 flex-1 text-left",
                    openItem === item.id.toString() 
                      ? "bg-emerald-500/10 border border-emerald-500/30" 
                      : "bg-slate-800/50 border border-slate-700/50 hover:bg-emerald-500/5 hover:border-emerald-500/20",
                    questionClassName
                  )}
                >
                  {item.icon && (
                    <span
                      className={cn(
                        "absolute bottom-6 text-lg",
                        item.iconPosition === "right" ? "right-4" : "left-4"
                      )}
                      style={{
                        transform: item.iconPosition === "right" 
                          ? "rotate(7deg)" 
                          : "rotate(-4deg)",
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className={cn(
                    "font-semibold text-lg transition-colors",
                    openItem === item.id.toString() 
                      ? "text-emerald-300" 
                      : "text-white group-hover:text-emerald-300"
                  )}>
                    {item.question}
                  </span>
                </div>

                <div 
                  className={cn(
                    "flex-shrink-0 p-2 rounded-full transition-all duration-300",
                    openItem === item.id.toString() 
                      ? "bg-emerald-500/20 text-emerald-300" 
                      : "bg-slate-700/50 text-gray-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400"
                  )}
                >
                  {openItem === item.id.toString() ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content asChild forceMount>
              <motion.div
                initial="collapsed"
                animate={openItem === item.id.toString() ? "open" : "collapsed"}
                variants={{
                  open: { opacity: 1, height: "auto" },
                  collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 ml-4">
                  <div
                    className={cn(
                      "relative max-w-none rounded-2xl glass-morphism p-6 text-gray-300 leading-relaxed",
                      answerClassName
                    )}
                  >
                    {item.answer}
                  </div>
                </div>
              </motion.div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
} 