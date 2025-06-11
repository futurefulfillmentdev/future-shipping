"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MessageSquare, Brain, FileText } from 'lucide-react';
import Link from 'next/link';
import EarthAnimation from '@/components/EarthAnimation';
import { GradientCard } from '@/components/ui/gradient-card';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';
import { CTASection } from '@/components/ui/cta-with-rectangle';
import { Faq5 } from '@/components/ui/faq-5';

// Word-by-word animation component
const AnimatedText = ({ children, delay = 0 }: { children: string; delay?: number }) => {
  const words = children.split(' ');
  
  return (
    <>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ 
            opacity: 0, 
            filter: 'blur(10px)',
            y: 20
          }}
          animate={{ 
            opacity: 1, 
            filter: 'blur(0px)',
            y: 0
          }}
          transition={{
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
            delay: delay + (index * 0.1)
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </>
  );
};



export default function Home() {
  const [, setGlobeReady] = useState(false);

  const handleGlobeReady = () => {
    setGlobeReady(true);
  };

  // Auto-trigger after a delay as fallback
  useState(() => {
    const timer = setTimeout(() => {
      setGlobeReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <>
      <main className="min-h-screen bg-slate-900 bg-motion bg-bottom-glow bg-top-stars relative overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center">
          {/* Simple Gradient Overlay from Top */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent pointer-events-none z-5"></div>

          {/* Earth Animation - Full Hero Background */}
          <EarthAnimation onGlobeReady={handleGlobeReady} />
          
          {/* Bottom Black Gradient for Page Transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-10" />
          
          {/* Content */}
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            {/* Badge */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.5
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism mb-8"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-medium">
            AI-Powered Shipping Optimization
              </span>
          </motion.div>

            {/* Main Headline with Word-by-Word Animation */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <AnimatedText delay={0.8}>Find Your</AnimatedText>{' '}
                <motion.span 
                initial={{ 
                  opacity: 0, 
                  filter: 'blur(10px)',
                  y: 20
                }}
                animate={{ 
                  opacity: 1, 
                  filter: 'blur(0px)',
                  y: 0
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                  delay: 1.1
                }}
                className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
              >
                Cheapest
                </motion.span>
              <br />
              <AnimatedText delay={1.4}>Fulfillment Option</AnimatedText>
            </h1>

            {/* Subtitle with Word-by-Word Animation */}
            <div className="text-lg sm:text-xl md:text-2xl text-emerald-300 mb-4 font-medium">
              <AnimatedText delay={2.1}>This FREE &ldquo;Shipping Cost Analyzer&rdquo;</AnimatedText>
              <br />
              <AnimatedText delay={2.5}>will save you</AnimatedText>{' '}
              <span className="text-emerald-400 font-bold">
                <AnimatedText delay={2.9}>$1000s per month</AnimatedText>
              </span>
            </div>
            
            {/* Description with Word-by-Word Animation */}
            <div className="text-base sm:text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              <AnimatedText delay={3.5}>
                We analyzed 1,000+ eCommerce brands across Australia & China to create an AI that instantly finds your most cost-effective shipping strategy
              </AnimatedText>
            </div>
            
            {/* CTA Button */}
          <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ 
                duration: 0.8, 
                ease: [0.23, 1, 0.32, 1],
                delay: 4.8
              }}
              className="mb-16"
            >
              <Link href="/quiz">
                <button className="liquid-button text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 rounded-full">
                  <div className="sm:hidden flex flex-col items-center">
                    <span>Get Started</span>
                    <span className="text-xs text-emerald-300 font-normal">100% Free</span>
                  </div>
                  <span className="hidden sm:inline">Get My FREE Analysis in 3 Minutes →</span>
                </button>
              </Link>
          </motion.div>
          
            {/* Trust Indicators */}
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.23, 1, 0.32, 1],
                delay: 5.3
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-emerald-400">✓</div>
                <span>Trusted by 500+ Australian brands</span>
                    </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-emerald-400">✓</div>
                <span>No credit card required</span>
                  </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-emerald-400">✓</div>
                <span>100% free analysis</span>
                </div>
              </motion.div>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true }}
              transition={{
                duration: 0.8,
                ease: [0.23, 1, 0.32, 1],
                delay: 0.2
              }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Here's How It Works:
            </motion.h2>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <GradientCard
              step="Step 1"
              title="Tell Us About Your Business"
              description="Answer 12 quick questions about your current shipping setup, order volume, and growth goals"
              icon={MessageSquare}
              delay={0.3}
            />
            
            <GradientCard
              step="Step 2"
              title="Our AI Gets to Work"
              description="We'll analyze your data against our database of 500+ brands and calculate your optimal fulfillment strategy in real-time"
              icon={Brain}
              delay={0.5}
            />
            
            <GradientCard
              step="Step 3"
              title="Get Your Custom Plan"
              description="Receive a detailed breakdown of your best shipping options with exact cost savings per month"
              icon={FileText}
              delay={0.7}
            />
          </div>
        </div>
      </section>

      {/* What You'll Get Section */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <motion.h2
            initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1],
              delay: 0.2
            }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Get Your Complete Shipping Strategy That can Save{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                30-50%
            </span>{' '}
              on Fulfillment Costs
          </motion.h2>

          {/* Benefits Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1],
              delay: 0.4
            }}
            className="glass-morphism p-8 md:p-12 rounded-3xl mb-12 mt-12"
          >
            <div className="space-y-8">
              {[
                {
                  title: "Optimal Fulfillment Method",
                  description: "Whether you should ship yourself, use 1 warehouse, or go multi-state",
                  delay: 0.6
                },
                {
                  title: "Best Carrier Recommendations", 
                  description: "Exactly which shipping lines will save you the most money based on your parcel specs",
                  delay: 0.8
                },
                {
                  title: "Monthly Savings Calculator",
                  description: "See how much you'll save compared to your current setup (average: $2,500/month)",
                  delay: 1.0
                }
              ].map((benefit, index) => (
              <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    ease: [0.23, 1, 0.32, 1],
                    delay: benefit.delay
                  }}
                  className="flex items-start gap-4 text-left group"
                >
                  {/* Checkmark */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      {benefit.description}
                    </p>
                </div>
              </motion.div>
            ))}
          </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.23, 1, 0.32, 1],
              delay: 1.2
            }}
          >
            <Link href="/quiz">
              <button className="liquid-button text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-4 rounded-full">
                <div className="sm:hidden flex flex-col items-center">
                  <span>Get Started</span>
                  <span className="text-xs text-emerald-300 font-normal">100% Free</span>
                </div>
                <span className="hidden sm:inline">Get My FREE Shipping Strategy in 3 Minutes</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection
        title="Join 500+ Other Successful eCommerce Brands We've Helped Optimize"
        testimonials={[
          {
            author: {
              name: "Sarah",
              handle: "Skincare Brand (1,200 orders/month)"
            },
            text: "Switched from Australia Post to Future&apos;s cubic weight line and saved $4,200 per month on the same volume"
          },
          {
            author: {
              name: "Marcus", 
              handle: "Fashion Brand (2,800 orders/month)"
            },
            text: "Moving to multi-state fulfillment cut our delivery times in half and reduced shipping costs by 35%"
          },
          {
            author: {
              name: "Lisa",
              handle: "Supplement Brand (3,000 orders/month)"
            },
            text: "The China 3PL setup saved us $8 per order on international shipping - that&apos;s $24,000 per month!"
          }
                 ]}
       />

      {/* Urgency CTA Section */}
      <CTASection
        badge={{
          text: "🔥 LIMITED TIME OFFER"
        }}
        title="This analysis normally costs $2,500 through our consulting service - but it's completely FREE this week only"
        description="Limited spots available - We can only process 100 shipping strategies per day due to the intensive AI analysis required"
        action={{
          text: "Claim Your FREE Analysis Now →",
          href: "/quiz"
        }}
        withGlow={true}
      />

      {/* FAQ Section */}
      <Faq5
        badge="FAQ"
        heading="Frequently Asked Questions"
        description="Get instant answers to common questions about our shipping analysis platform"
        faqs={[
          {
            question: "How accurate is this analysis?",
            answer: "Our AI has been trained on 1,000+ real eCommerce brands and their actual shipping data. The recommendations are based on proven strategies that have saved our clients an average of $2,500/month."
          },
          {
            question: "What if I'm already using a 3PL?",
            answer: "Perfect! We'll analyze if you're using the optimal 3PL setup and shipping lines. Many brands are overpaying by 30-40% even with a 3PL."
          },
          {
            question: "Does this work for international brands?",
            answer: "Yes - we have specific strategies for China-based fulfillment, Australia-based fulfillment, and hybrid approaches depending on your customer base."
          },
          {
            question: "How long does the analysis take?",
            answer: "The quiz takes 3-4 minutes to complete, then our AI generates your custom strategy in about 2 minutes."
          }
        ]}
      />
    </>
  );
}
