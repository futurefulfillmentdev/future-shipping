"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { generateResult } from '@/lib/futureFulfillmentAdvisor';

interface QuizFormAnswers {
  full_name: string;
  email: string;
  phone: string;
  website_url: string;
  products: string;
  package_weight_choice: string;
  package_size_choice: string;
  monthly_orders_choice: string;
  customer_location_choice: string;
  current_shipping_method: string;
  biggest_shipping_problem: string;
  sku_range_choice: string;
  delivery_expectation_choice: string;
  shipping_cost_choice: string;
}

export default function ResultPage() {
  const [result, setResult] = useState<ReturnType<typeof generateResult> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get quiz data from localStorage
      const quizData = localStorage.getItem('quizAnswers');
      if (!quizData) {
        // Redirect to quiz if no data
        window.location.href = '/quiz';
        return;
      }

      const answers: QuizFormAnswers = JSON.parse(quizData);
      const generatedResult = generateResult(answers);
      
      setResult(generatedResult);
      setLoading(false);
    } catch (error) {
      console.error('Error processing quiz results:', error);
      // Redirect to quiz on error
      window.location.href = '/quiz';
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center bg-motion bg-bottom-glow bg-top-stars">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-xl">Analyzing your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Something went wrong. Please try again.</p>
          <Link href="/quiz" className="text-emerald-400 hover:text-emerald-300 mt-4 inline-block">
            ← Back to Quiz
          </Link>
        </div>
      </div>
    );
  }

  const { content, universalSection } = result;

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden bg-motion bg-bottom-glow bg-top-stars">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {content.firstname} - Your Quiz Results Are In
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-emerald-400 mb-6">
            {content.title}
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="glass-morphism p-8 rounded-3xl mb-8"
        >
          <ul className="space-y-4 text-gray-300">
            {content.benefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Savings */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="glass-morphism p-8 rounded-3xl mb-8"
        >
          <h3 className="text-2xl font-bold mb-4 text-emerald-400">Estimated Monthly Savings</h3>
          <p className="text-xl text-white">
            Up to <span className="text-emerald-400 font-bold">${content.savings_per_order}</span> saved per order × {content.monthly_orders} orders/month = 
            <span className="text-emerald-400 font-bold"> ${content.total_monthly_savings.toLocaleString()}/month</span>
          </p>
          {content.note && (
            <p className="text-gray-400 mt-2">{content.note}</p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl font-bold mb-6">What To Do Next</h3>
          <a 
            href={content.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-button text-white font-semibold text-lg px-8 py-4 rounded-full inline-block mb-4"
          >
            {content.ctaTitle}
          </a>
          <p className="text-gray-400">
            {content.ctaText}
          </p>
        </motion.div>

        {/* Universal Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="border-t border-gray-800 pt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">{universalSection.title}</h3>
            <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {universalSection.description}
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {universalSection.testimonials.map((testimonial: { quote: string; author: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + (index * 0.1), ease: [0.23, 1, 0.32, 1] }}
                className="glass-morphism p-6 rounded-2xl"
              >
                <p className="text-gray-300 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-emerald-400 font-semibold">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.23, 1, 0.32, 1] }}
            className="text-center"
          >
            <a 
              href="https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ"
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-button text-white font-semibold text-lg px-8 py-4 rounded-full inline-block mb-6"
            >
              👉 Get a Quote
            </a>
            
            {/* Back to Home */}
            <div>
              <Link href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 