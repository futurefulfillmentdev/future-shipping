"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { generateResult } from '@/lib/futureFulfillmentAdvisor';

interface QuizFormAnswers {
  full_name: string;
  email: string;
  phone: string;
  website_url: string;
  products: string;
  package_weight_choice: string;
  package_size_choice: string;
  volume_range: string;
  customer_location_choice: string;
  current_shipping_method: string;
  biggest_shipping_problem: string;
  sku_range_choice: string;
  delivery_expectation_choice: string;
  shipping_cost_choice: string;
  category?: string;
}



const GEAR_LISTS: Record<"low" | "mid" | "high", string[]> = {
  low: ["Dymo 4XL thermal label printer", "1000 × 500 mm bubble-wrap roll"],
  mid: ["Zebra ZT230 industrial printer", "Handheld barcode scanner"],
  high: ["Automated carton sealer", "Powered conveyor bench", "Warehouse mobile work-station"]
};



const SATCHEL_PRICES: Record<string, number> = { S: 0.6, M: 0.9, L: 1.3, XL: 1.7 };
const SPEED_GAIN_DAYS: Record<string, number> = { DIY: 0, AUS_3PL: 1, AUS_MULTI: 2, CHINA_3PL: 3 };
const CALENDLY_SUFFIX: Record<string, string> = { DIY: "?topic=diy", AUS_3PL: "?topic=aus1", AUS_MULTI: "?topic=ausmulti", CHINA_3PL: "?topic=cn" };
const RETURNS_RISK_CATEGORIES = new Set(["Clothing & Accessories", "Tech & Electronics"]);

// Helper function to extract insights from rendered HTML
function extractInsight(html: string, key: string): string | number | null {
  // For shipping health score
  if (key === 'ship_health') {
    const match = html.match(/Shipping Health: (\d+)%/);
    return match ? parseInt(match[1]) : null;
  }
  
  // For CO2 text
  if (key === 'co2_text') {
    const match = html.match(/≈ [\d.]+ kg CO₂e[^<]+/);
    return match ? match[0] : null;
  }
  
  // For duty text
  if (key === 'duty_text') {
    const match = html.match(/🇦🇺[^<]+|🌍[^<]+/);
    return match ? match[0] : null;
  }
  
  // For margin alert
  if (key === 'margin_alert_text') {
    const match = html.match(/⚠️ Margin Alert[^<]+|📊 Moderate shipping[^<]+|✅ Shipping costs[^<]+/);
    return match ? match[0] : null;
  }
  
  // For inventory alert
  if (key === 'inv_alert_text') {
    const match = html.match(/🚀 Excellent turnover[^<]+|📈 Good turnover[^<]+|📊 Moderate turnover[^<]+|⚠️ Low turnover[^<]+/);
    return match ? match[0] : null;
  }
  
  // For carrier headline
  if (key === 'carrier_headline') {
    const match = html.match(/Best Carrier:<\/strong> ([^<]+)<br/);
    return match ? match[1] : null;
  }
  
  // For carrier tip
  if (key === 'carrier_tip') {
    const match = html.match(/Best Carrier:<\/strong> [^<]+<br\/>([^<]+)/);
    return match ? match[1] : null;
  }
  
  // For weight education
  if (key === 'weight_education') {
    const match = html.match(/📦 Shipping Weight Education[^<]+/);
    return match ? match[0] : null;
  }
  
  // For warehouse costs
  if (key === 'warehouse_costs') {
    const match = html.match(/🏭 [^<]+/);
    return match ? match[0] : null;
  }
  
  // For case study
  if (key === 'case_study') {
    const match = html.match(/<blockquote>([^<]+)<\/blockquote>/);
    return match ? match[1] : null;
  }
  
  return null;
}





function buildSavingsSliderData(savingsPerOrder: number, currentOrders: number): { orders: number; monthly_saving: number }[] {
  const ceilings = [300, 500, 1000, 2000, 2500];
  const ceiling = ceilings.find(c => c > currentOrders) || currentOrders;
  const data: { orders: number; monthly_saving: number }[] = [];
  for (let o = currentOrders; o <= ceiling; o += 250) {
    data.push({ orders: o, monthly_saving: Math.round(o * savingsPerOrder) });
  }
  if (data[data.length - 1].orders !== ceiling) {
    data.push({ orders: ceiling, monthly_saving: Math.round(ceiling * savingsPerOrder) });
  }
  return data;
}





// NEW: CO2 Footprint Component


// Removed duplicate - using enhanced version below

// Removed old components - using enhanced versions below

function SpeedBadge({ days }: { days: number }) {
  if (days === 0) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="inline-block mb-4"
    >
      <span className="px-4 py-2 rounded-full text-white font-semibold" style={{ backgroundColor: '#6BE53D' }}>
        ⚡ Speed Gain: −{days} days
      </span>
    </motion.div>
  );
}

function GearList({ monthlyOrders }: { monthlyOrders: number }) {
  const band = monthlyOrders < 300 ? "low" : monthlyOrders <= 500 ? "mid" : "high";
  const gear = GEAR_LISTS[band];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.0 }}
      className="glass-morphism p-8 rounded-3xl border border-gray-700/50 mb-8"
    >
      <h3 className="text-2xl font-bold mb-4" style={{ color: '#6BE53D' }}>Recommended Gear</h3>
      <ul className="space-y-3 text-gray-300">
        {gear.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span style={{ color: '#6BE53D' }} className="text-xl">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}





function ReturnsRiskAlert() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.1 }}
      className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    >
      <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-4">
        <p className="text-orange-200">
          <strong>Heads up:</strong> Products in this category see return rates above 20%. Tighten QC and offer hassle-free exchanges to stay ahead.
        </p>
      </div>
    </motion.div>
  );
}



function SavingsSlider({ data }: { data: { orders: number; monthly_saving: number }[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.0 }}
      className="glass-morphism p-8 rounded-3xl border border-gray-700/50 mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#6BE53D]/20 flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
        <h3 className="text-2xl font-bold" style={{ color: '#6BE53D' }}>Savings Projection</h3>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="range"
            min="0"
            max={data.length - 1}
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
            className="premium-slider w-full h-2 rounded-full appearance-none cursor-pointer transition-all duration-300"
            style={{ 
              background: `linear-gradient(to right, #6BE53D 0%, #6BE53D ${(selectedIndex / (data.length - 1)) * 100}%, rgba(0,0,0,0.4) ${(selectedIndex / (data.length - 1)) * 100}%, rgba(0,0,0,0.4) 100%)`
            }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{data[0].orders} orders</span>
          <span>{data[data.length - 1].orders} orders</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className="bg-[#6BE53D]/10 rounded-lg p-6 border border-[#6BE53D]/20">
          <p className="text-2xl text-white mb-2">
            At <span className="font-bold" style={{ color: '#6BE53D' }}>{data[selectedIndex].orders}</span> orders/month
          </p>
          <p className="text-3xl font-bold" style={{ color: '#6BE53D' }}>
            ${data[selectedIndex].monthly_saving.toLocaleString()}/month saved
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Annual savings: ${(data[selectedIndex].monthly_saving * 12).toLocaleString()}
          </p>
        </div>
      </div>

      <style jsx>{`
        .premium-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6BE53D, #5BC72D);
          border: 2px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 16px rgba(107, 229, 61, 0.3), 0 0 0 4px rgba(107, 229, 61, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 24px rgba(107, 229, 61, 0.4), 0 0 0 6px rgba(107, 229, 61, 0.15);
        }
        
        .premium-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6BE53D, #5BC72D);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(107, 229, 61, 0.3), 0 0 0 4px rgba(107, 229, 61, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .premium-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 24px rgba(107, 229, 61, 0.4), 0 0 0 6px rgba(107, 229, 61, 0.15);
        }
        
        .premium-slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
        }
        
        .premium-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
          border: none;
        }
      `}</style>
    </motion.div>
  );
}

function CheatSheetDownload() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.3 }}
      className="text-center mb-8"
    >
      <a 
        href="https://futurefulfilment.com/global-tax-guide.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-3 border-2 rounded-full font-semibold transition-all duration-300 hover:bg-opacity-20"
        style={{ borderColor: '#6BE53D', color: '#6BE53D' }}
      >
        📄 Download Customs & Duties Cheat-Sheet
      </a>
    </motion.div>
  );
}

// Enhanced CO2 Impact Component
const CO2Impact = ({ co2Text }: { co2Text: string }) => (
  <motion.div 
    className="glass-morphism p-6 rounded-3xl border border-gray-700/50"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
        <span className="text-2xl">🌱</span>
      </div>
      <h3 className="text-xl font-semibold text-white">Environmental Impact</h3>
    </div>
    <p className="text-gray-300 leading-relaxed">{co2Text}</p>
    <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
      <p className="text-sm text-green-300">💡 Tip: Sea freight reduces CO₂ emissions by up to 95% compared to air freight for international shipments.</p>
    </div>
  </motion.div>
);



// Weight Pricing Education Component
const WeightPricingEducation = ({ weightEducation }: { weightEducation: string }) => (
  <motion.div 
    className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
        <span className="text-2xl">⚖️</span>
      </div>
      <h3 className="text-xl font-semibold text-white">Shipping Weight Education</h3>
    </div>
    <p className="text-gray-300 leading-relaxed mb-4">{weightEducation}</p>
    
    <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
      <h4 className="font-medium text-orange-300 mb-2">Cubic Weight Formula</h4>
      <div className="font-mono text-sm text-gray-300 bg-black/30 p-2 rounded">
        Cubic Weight = (L(cm) x W(cm) x H(cm)) / 4,000
      </div>
      <p className="text-sm text-gray-400 mt-2">Carriers charge for whichever is higher: actual weight or cubic weight</p>
    </div>
  </motion.div>
);



// Enhanced Carrier Recommendation Component
const CarrierRecommendation = ({ 
  carrierHeadline, 
  carrierTip, 
  pageId, 
  productCategory 
}: { 
  carrierHeadline: string; 
  carrierTip: string; 
  pageId?: string; 
  productCategory?: string; 
}) => {
  // For China results, show just the product category
  if (pageId === 'CN_PAGE' && productCategory) {
    return (
      <motion.div 
        className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#6BE53D]/20 flex items-center justify-center">
            <span className="text-2xl">🚚</span>
          </div>
          <h3 className="text-xl font-semibold text-white">Best Carrier for You</h3>
        </div>
        <h4 className="text-lg font-medium text-[#6BE53D] mb-2">{productCategory}</h4>
        <p className="text-gray-300 leading-relaxed">Most economical option (3-8 days worldwide). Good for low-value items under de minimis thresholds.</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-[#6BE53D]/20 text-[#6BE53D] rounded-full text-sm border border-[#6BE53D]/30">
            Recommended
          </span>
        </div>
      </motion.div>
    );
  }

  // Extract carrier type and determine appropriate badges for non-China results
  const getCarrierBadges = (headline: string) => {
    const badges = [];
    
    // Always add recommended badge
    badges.push({
      text: "Recommended",
      bgColor: "bg-[#6BE53D]/20",
      textColor: "text-[#6BE53D]",
      borderColor: "border-[#6BE53D]/30"
    });
    
    // Add specific badges based on carrier type
    if (headline.toLowerCase().includes('express')) {
      badges.push({
        text: "Fast Delivery",
        bgColor: "bg-blue-500/20",
        textColor: "text-blue-300",
        borderColor: "border-blue-500/30"
      });
    }
    
    if (headline.toLowerCase().includes('dhl') || headline.toLowerCase().includes('fedex')) {
      badges.push({
        text: "Premium Service",
        bgColor: "bg-orange-500/20",
        textColor: "text-orange-300",
        borderColor: "border-orange-500/30"
      });
    }
    
    return badges;
  };

  const badges = getCarrierBadges(carrierHeadline);

  return (
    <motion.div 
      className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#6BE53D]/20 flex items-center justify-center">
          <span className="text-2xl">🚚</span>
        </div>
        <h3 className="text-xl font-semibold text-white">Best Carrier for You</h3>
      </div>
      <h4 className="text-lg font-medium text-[#6BE53D] mb-2">{carrierHeadline}</h4>
      <p className="text-gray-300 leading-relaxed">{carrierTip}</p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <span 
            key={index}
            className={`px-3 py-1 ${badge.bgColor} ${badge.textColor} rounded-full text-sm border ${badge.borderColor}`}
          >
            {badge.text}
          </span>
        ))}
      </div>
    </motion.div>
  );
};



export default function ResultPage() {
  const [result, setResult] = useState<ReturnType<typeof generateResult> | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<QuizFormAnswers | null>(null);

  useEffect(() => {
    try {
      const quizData = localStorage.getItem('quizAnswers');
      if (!quizData) {
        window.location.href = '/quiz';
        return;
      }

      const answers: QuizFormAnswers = JSON.parse(quizData);
      const generatedResult = generateResult(answers);
      
      setResult(generatedResult);
      setQuizAnswers(answers);
      setLoading(false);
    } catch (error) {
      console.error('Error processing quiz results:', error);
      window.location.href = '/quiz';
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Green gradient background matching home page */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#6BE53D]/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
        
        <div className="text-center relative z-10">
          {/* Removed spinner - just show text with subtle animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="text-xl">Analyzing your results...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-[#6BE53D] animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#6BE53D] animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#6BE53D] animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!result || !quizAnswers) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Green gradient background matching home page */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#6BE53D]/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
        
        <div className="text-center relative z-10">
          <p className="text-xl">Something went wrong. Please try again.</p>
          <Link href="/quiz" className="mt-4 inline-block transition-colors" style={{ color: '#6BE53D' }}>
            ← Back to Quiz
          </Link>
        </div>
      </div>
    );
  }

  const { content, universalSection, page_id } = result;
  
  // Calculate enhanced insights
  const speedGainDays = SPEED_GAIN_DAYS[page_id.toUpperCase().replace('_', '_')] || 0;
  const showReturnsAlert = quizAnswers.category && RETURNS_RISK_CATEGORIES.has(quizAnswers.category) && page_id !== 'DIY_PAGE';
  const savingsSliderData = page_id !== 'DIY_PAGE' ? buildSavingsSliderData(content.savings_per_order, content.monthly_orders) : null;
  const showCheatSheet = page_id === 'CN_PAGE';
  const showGearList = page_id === 'DIY_PAGE';
  const calendlySuffix = CALENDLY_SUFFIX[page_id.toUpperCase().replace('_', '_')] || '';

  // Extract all the enhanced insights from the result
  const carrierHeadline = String(extractInsight(result.rendered_page, 'carrier_headline') || '');
  const carrierTip = String(extractInsight(result.rendered_page, 'carrier_tip') || '');
  const weightEducation = String(extractInsight(result.rendered_page, 'weight_education') || '');

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden animate-fadeIn">
      {/* Green gradient background matching home page */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#6BE53D]/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
      
      {/* Bottom green glow */}
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-[#6BE53D]/25 via-[#6BE53D]/15 to-transparent pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 pt-safe-top pb-safe-bottom">
        
        {/* Future Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mt-4 sm:mt-6 mb-6 sm:mb-8"
        >
          <Image
            src="/future-logo-white.svg"
            alt="Future Fulfilment"
            width={240}
            height={56}
            className="mx-auto h-6 sm:h-7 md:h-8 lg:h-10 w-auto"
            priority
          />
        </motion.div>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-8 sm:mb-12 mt-12 sm:mt-16"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {content.firstname.charAt(0).toUpperCase() + content.firstname.slice(1).toLowerCase()} - Your Quiz Results Are In
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6" style={{ color: '#6BE53D' }}>
            {content.title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        {/* Benefits - What this gives you */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="glass-morphism p-4 sm:p-6 md:p-8 rounded-3xl mb-6 sm:mb-8 border border-gray-700/50"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6" style={{ color: '#6BE53D' }}>What This Gives You</h3>
          <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-300">
            {content.benefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <span style={{ color: '#6BE53D' }} className="text-lg sm:text-xl">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 sm:mt-6">
            <SpeedBadge days={speedGainDays} />
          </div>
        </motion.div>

        {/* Enhanced Educational Components */}
        <CarrierRecommendation 
          carrierHeadline={carrierHeadline} 
          carrierTip={carrierTip} 
          pageId={page_id}
          productCategory={quizAnswers.products}
        />
        
        <WeightPricingEducation weightEducation={weightEducation} />
        


        {/* Gear List (DIY only) */}
        {showGearList && <GearList monthlyOrders={content.monthly_orders} />}

        {/* Savings */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="glass-morphism p-4 sm:p-6 md:p-8 rounded-3xl border border-gray-700/50 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-12 h-12 rounded-full bg-[#6BE53D]/20 flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#6BE53D' }}>Estimated Monthly Savings</h3>
          </div>
          
          <div className="bg-[#6BE53D]/10 rounded-lg p-4 sm:p-6 border border-[#6BE53D]/20 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400 mb-1">Per Order Savings</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: '#6BE53D' }}>${content.savings_per_order}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Monthly Orders</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{content.monthly_orders.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Monthly Savings</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: '#6BE53D' }}>${content.total_monthly_savings.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-base sm:text-lg text-white mb-2">
              Annual savings potential: <span className="font-bold" style={{ color: '#6BE53D' }}>${(content.total_monthly_savings * 12).toLocaleString()}</span>
          </p>
          {content.note && (
              <p className="text-sm sm:text-base text-gray-400">{content.note}</p>
          )}
          </div>
        </motion.div>

        {/* Savings Slider */}
        {savingsSliderData && <SavingsSlider data={savingsSliderData} />}

        {/* Returns Risk Alert */}
        {showReturnsAlert && <ReturnsRiskAlert />}

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">What To Do Next</h3>
          <a 
            href={content.ctaUrl + calendlySuffix}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-button text-white font-semibold text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full inline-block mb-3 sm:mb-4"
          >
            {content.ctaTitle}
          </a>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            {content.ctaText}
          </p>
        </motion.div>

        {/* Universal Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="border-t border-gray-800 pt-8 sm:pt-12"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">{universalSection.title}</h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {universalSection.description}
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {universalSection.testimonials.map((testimonial: { quote: string; author: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + (index * 0.1), ease: [0.23, 1, 0.32, 1] }}
                className="glass-morphism p-4 sm:p-6 rounded-3xl border border-gray-700/50"
              >
                <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-sm sm:text-base font-semibold" style={{ color: '#6BE53D' }}>{testimonial.author}</p>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-16 sm:mb-20 md:mb-24"
          >
            <a 
              href={"https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ" + calendlySuffix}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-button text-white font-semibold text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full inline-block mb-8 sm:mb-12"
            >
              👉 Get a Quote
            </a>
            
            {/* Footer text */}
            <div className="text-gray-400 text-xs sm:text-sm">
              ©2025 Future Fulfilment. All rights reserved. • 
              <a href="https://futurefulfilment.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-[#6BE53D] transition-colors mx-1">
                Privacy Policy
              </a> • 
              <a href="https://futurefulfilment.com/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:text-[#6BE53D] transition-colors mx-1">
                Terms And Conditions
              </a>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 