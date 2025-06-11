import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Faq5Props {
  badge?: string;
  heading?: string;
  description?: string;
  faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
  {
    question: "What is a FAQ and why is it important?",
    answer:
      "FAQ stands for Frequently Asked Questions. It is a list that provides answers to common questions people may have about a specific product, service, or topic.",
  },
  {
    question: "Why should I use a FAQ on my website or app?",
    answer:
      "Utilizing a FAQ section on your website or app is a practical way to offer instant assistance to your users or customers. Instead of waiting for customer support responses, they can find quick answers to commonly asked questions. ",
  },
  {
    question: "How do I effectively create a FAQ section?",
    answer:
      "Creating a FAQ section starts with gathering the most frequent questions you receive from your users or customers. Once you have a list, you need to write clear, detailed, and helpful answers to each question.",
  },
  {
    question: "What are the benefits of having a well-maintained FAQ section?",
    answer:
      "There are numerous advantages to maintaining a robust FAQ section. Firstly, it provides immediate answers to common queries, which improves the user experience.",
  },
];

export const Faq5 = ({
  badge = "FAQ",
  heading = "Common Questions & Answers",
  description = "Find out all the essential details about our platform and how it can serve your needs.",
  faqs = defaultFaqs,
}: Faq5Props) => {
  return (
    <section className="relative bg-black py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20">
              {badge}
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
          >
            {heading}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-300 max-w-3xl mx-auto"
          >
            {description}
          </motion.p>
        </div>
        
        <div className="mx-auto mt-12 sm:mt-16 max-w-4xl">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3 + (index * 0.1), 
                ease: [0.23, 1, 0.32, 1] 
              }}
              className="mb-6 sm:mb-8 flex gap-4 sm:gap-6 group"
            >
              <span className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 font-mono text-xs sm:text-sm text-emerald-300 group-hover:bg-emerald-500/30 transition-colors duration-300">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="mb-2 sm:mb-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-emerald-300 transition-colors duration-300">
                    {faq.question}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link href="/quiz">
            <button className="liquid-button text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 rounded-full mb-6">
              <div className="sm:hidden flex flex-col items-center">
                <span>Get Started</span>
                <span className="text-xs text-emerald-300 font-normal">100% Free</span>
              </div>
              <span className="hidden sm:inline">Get My FREE Shipping Strategy in 3 Minutes</span>
            </button>
          </Link>
          <p className="text-gray-400 text-sm">
            No credit card required. Get your complete analysis sent via email and SMS.
          </p>
        </motion.div>
      </div>

      {/* Animated Green Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main animated gradient */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-green-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-teal-500/25 via-emerald-400/15 to-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/20 via-teal-300/15 to-green-300/10 rounded-full blur-2xl animate-drift"></div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-emerald-900/30 via-emerald-900/15 to-transparent"></div>
      </div>
    </section>
  );
}; 