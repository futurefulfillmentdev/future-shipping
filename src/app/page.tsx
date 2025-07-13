"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MessageSquare, Brain, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import EarthAnimation from '@/components/EarthAnimation';
import { GradientCard } from '@/components/ui/gradient-card';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';
import { CTASection } from '@/components/ui/cta-with-rectangle';
import { Faq5 } from '@/components/ui/faq-5';

// Optimized word-by-word animation component
const AnimatedText = ({ children, delay = 0 }: { children: string; delay?: number }) => {
  const words = children.split(' ');
  
  return (
    <>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ 
            opacity: 0, 
            y: 10 // Reduced from 20 for faster animation
          }}
          animate={{ 
            opacity: 1, 
            y: 0
          }}
          transition={{
            duration: 0.4, // Reduced from 0.6 for faster animation
            ease: [0.23, 1, 0.32, 1],
            delay: delay + (index * 0.05) // Reduced from 0.1 for faster sequence
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
  const [globeReady, setGlobeReady] = useState(false);

  const handleGlobeReady = () => {
    setGlobeReady(true);
  };

  // Faster fallback trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobeReady(true);
    }, 500); // Reduced from 1000ms for faster fallback
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-black relative overflow-hidden">
        <div className="relative min-h-screen flex items-center justify-center pt-safe-top">
          {/* Simple Gradient Overlay from Top */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#6BE53D]/20 via-transparent to-transparent pointer-events-none z-5"></div>

          {/* Earth Animation - Lazy loaded */}
          <EarthAnimation onGlobeReady={handleGlobeReady} />
          
          {/* Bottom Black Gradient for Page Transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-10" />
          
          {/* Content - Start showing immediately */}
          <div className="relative z-20 text-center px-4 max-w-5xl mx-auto pt-16 sm:pt-8">
            {/* Logo - Show first */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.05
              }}
              className="mb-8 sm:mb-10"
            >
              <Image 
                src="/future-logo-white.svg" 
                alt="Future Fulfillment" 
                width={200} 
                height={46}
                className="h-10 sm:h-12 w-auto mx-auto" 
                priority
              />
            </motion.div>

            {/* Badge - Show immediately */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.1 // Reduced from 0.5
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-morphism mb-6 sm:mb-8"
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6BE53D' }}></div>
              <span className="text-xs sm:text-sm font-medium" style={{ color: '#6BE53D' }}>
                AI Compares the Market for eCommerce Fulfillment
              </span>
            </motion.div>

            {/* Main Headline - Show faster */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.3 // Reduced from 2.4
              }}
              className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight"
            >
              This Free "Shipping Cost Analyzer" Will Find Your Cheapest Fulfillment Option & Save You $1000s Per Month
            </motion.h1>

            {/* Subtitle - Show faster */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.5 // Reduced from 3.2
              }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-[#6BE53D] mb-4 sm:mb-6 leading-relaxed"
            >
              We analyzed 1,000+ eCommerce brands across the globe to create an AI that instantly finds the most cost-effective shipping strategy for YOUR specific business
            </motion.p>
            
            {/* CTA Button - Show faster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.7 // Reduced from 4.8
              }}
              className="mb-12 sm:mb-16"
            >
              <Link href="/quiz">
                <button className="liquid-button text-white font-semibold text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full">
                  <span className="sm:hidden">Get My FREE Shipping Strategy in 3 Minutes</span>
                  <span className="hidden sm:inline">Get My FREE Shipping Strategy in 3 Minutes</span>
                </button>
              </Link>
              <div className="sm:hidden mt-2">
                <span className="text-xs font-normal" style={{ color: '#6BE53D' }}>100% Free</span>
              </div>
            </motion.div>
          
            {/* Trust Indicators - Show faster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.9 // Reduced from 5.3
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#6BE53D' }}>✓</div>
                <span>Trusted by 500+ Australian brands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#6BE53D' }}>✓</div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#6BE53D' }}>✓</div>
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
            <span className="text-[#6BE53D]">
                30-50%
            </span>{' '}
              on Fulfillment&nbsp;Costs
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
                  {/* Checkmark (FAQ-style) */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6BE53D]/20 border border-[#6BE53D]/30 flex items-center justify-center group-hover:bg-[#6BE53D]/30 transition-colors duration-300">
                    <Check className="w-4 h-4 text-[#6BE53D]" strokeWidth={3} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[#6BE53D] transition-colors duration-300">
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
              <button className="liquid-button text-white font-semibold text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full">
                <span className="sm:hidden">Get Started</span>
                <span className="hidden sm:inline">Get My FREE Shipping Strategy in 3 Minutes</span>
              </button>
            </Link>
            <div className="sm:hidden mt-2">
              <span className="text-xs font-normal" style={{ color: '#6BE53D' }}>100% Free</span>
            </div>
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
