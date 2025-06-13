"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  monthly_orders_choice: string;
  customer_location_choice: string;
  current_shipping_method: string;
  biggest_shipping_problem: string;
  sku_range_choice: string;
  delivery_expectation_choice: string;
  shipping_cost_choice: string;
  category?: string;
}

// Helper functions extracted from advisor
const QUICK_TIPS: Record<string, string> = {
  "Hard to manage returns": "Set up an automated RMA portal so customers can self-serve returns – this cuts back-and-forth emails while giving you instant visibility on incoming stock.",
  "Too expensive": "Compare cubic and dead-weight dimensions on every SKU – trimming even 2 cm can shift you into the next satchel size and slash cost.",
  "Slow delivery": "Pre-print labels the night before dispatch to shave minutes off daily pick-pack and hit earlier carrier cut-offs.",
  "Hard to track inventory": "Deploy simple barcoding (even DYMO labels) so every SKU scan updates stock counts in real time – goodbye spreadsheet drama.",
  "Stockouts": "Set reorder alerts at 25% of weekly velocity to trigger purchase orders well before you hit zero.",
  "Packaging waste": "Right-size cartons with adjustable score lines – you'll protect products and avoid paying to ship fresh air."
};

const GEAR_LISTS: Record<"low" | "mid" | "high", string[]> = {
  low: ["Dymo 4XL thermal label printer", "1000 × 500 mm bubble-wrap roll"],
  mid: ["Zebra ZT230 industrial printer", "Handheld barcode scanner", "Pick-to-light shelf labels"],
  high: ["Automated carton sealer", "Powered conveyor bench", "Warehouse mobile work-station"]
};

const MIGRATION_MILESTONES = [
  "Contract signed & {{orders}} units inbound to warehouse",
  "System integrations & test orders live",
  "Inventory put-away and cycle counts verified",
  "First customer orders shipped via Future",
  "30-day review – optimisation & KPI report"
];

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

function calcReadiness(answers: QuizFormAnswers): number {
  let score = 100;
  const skuMapping: Record<string, number> = { "1-25": 25, "26-100": 100, "101-300": 300, "300+": 600 };
  const skuCount = skuMapping[answers.sku_range_choice] || 100;
  const shipsFromHome = answers.current_shipping_method.toLowerCase().includes("home") || answers.current_shipping_method.toLowerCase().includes("garage");
  if (skuCount > 100 && shipsFromHome) score -= 15;
  if (skuCount > 25) score -= 15;
  const fromChina = answers.current_shipping_method.toLowerCase().includes("china");
  if (answers.biggest_shipping_problem === "Hard to manage returns" && fromChina) score -= 20;
  if (answers.package_size_choice.toLowerCase().includes("very large")) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function calcPackagingCost(answers: QuizFormAnswers, monthlyOrders: number): number {
  const sizeMap: Record<string, string> = { small: "S", medium: "M", "very large": "XL" };
  const size = Object.keys(sizeMap).find(key => answers.package_size_choice.toLowerCase().includes(key)) || "L";
  const price = SATCHEL_PRICES[sizeMap[size] || "L"];
  return Math.round(price * monthlyOrders);
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

// React Components
function ProgressBar({ score }: { score: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-8"
    >
      <div className="glass-morphism p-6 rounded-3xl border border-gray-700/50">
        <div className="mb-3">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div 
              className="h-3 rounded-full"
              style={{ backgroundColor: '#6BE53D' }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
        </div>
        <p className="text-center text-lg">
          You're <span className="font-bold" style={{ color: '#6BE53D' }}>{score}%</span> ready for smooth fulfilment.
        </p>
      </div>
    </motion.div>
  );
}

// NEW: Shipping Health Score Component
function ShippingHealthScore({ score, marginAlert }: { score: number; marginAlert?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-morphism p-6 rounded-3xl border border-gray-700/50"
    >
      <h4 className="text-xl font-bold mb-4" style={{ color: '#6BE53D' }}>
        📊 Shipping Health Score
      </h4>
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-4">
          <motion.div 
            className="h-4 rounded-full"
            style={{ backgroundColor: score >= 75 ? '#6BE53D' : score >= 50 ? '#FFA500' : '#FF4444' }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, delay: 0.6 }}
          />
        </div>
      </div>
      <p className="text-center text-lg mb-2">
        <span className="font-bold" style={{ color: score >= 75 ? '#6BE53D' : score >= 50 ? '#FFA500' : '#FF4444' }}>
          {score}%
        </span> Health Score
      </p>
      {marginAlert && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mt-4">
          <p className="text-red-300 text-sm">⚠️ {marginAlert}</p>
        </div>
      )}
    </motion.div>
  );
}

// NEW: CO2 Footprint Component


// Removed duplicate - using enhanced version below

// NEW: Case Study Component
function CaseStudy({ caseStudy }: { caseStudy: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    >
      <h4 className="text-xl font-bold mb-4" style={{ color: '#6BE53D' }}>
        💼 Success Story
      </h4>
      <blockquote className="border-l-4 pl-4 italic text-gray-300" style={{ borderColor: '#6BE53D' }}>
        {caseStudy}
      </blockquote>
    </motion.div>
  );
}

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

function MigrationTimeline({ monthlyOrders }: { monthlyOrders: number }) {
  const timeline = MIGRATION_MILESTONES.map(m => m.replace("{{orders}}", String(monthlyOrders)));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.0 }}
      className="glass-morphism p-8 rounded-3xl border border-gray-700/50 mb-8"
    >
      <h3 className="text-2xl font-bold mb-4" style={{ color: '#6BE53D' }}>Migration Timeline</h3>
      <ol className="space-y-3 text-gray-300">
        {timeline.map((milestone, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full text-sm flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#6BE53D' }}>
              {index + 1}
            </span>
            <span>{milestone}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}

function PackagingCost({ cost }: { cost: number }) {
  const annualCost = cost * 12;
  const optimizedCost = Math.round(cost * 0.85); // Assume 15% savings possible
  const potentialSavings = cost - optimizedCost;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-xl font-semibold text-white">Packaging Cost Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
          <h4 className="font-medium text-amber-300 mb-2">Current Monthly Spend</h4>
          <p className="text-2xl font-bold" style={{ color: '#6BE53D' }}>${cost.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Annual: ${annualCost.toLocaleString()}</p>
        </div>
        
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <h4 className="font-medium text-green-300 mb-2">Optimization Potential</h4>
          <p className="text-2xl font-bold text-green-300">${potentialSavings.toLocaleString()}/month</p>
          <p className="text-sm text-gray-400">With right-sized packaging</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-sm text-blue-300">💡 Tip: Optimize packaging dimensions to reduce cubic weight charges and material costs by up to 15%.</p>
      </div>
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

function QuickTip({ tip }: { tip: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    >
      <h4 className="text-xl font-bold mb-4" style={{ color: '#6BE53D' }}>💡 Quick Tip</h4>
      <p className="text-gray-300">{tip}</p>
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
        <input
          type="range"
          min="0"
          max={data.length - 1}
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer transition-all duration-300 hover:h-4"
          style={{ background: `linear-gradient(to right, #6BE53D 0%, #6BE53D ${(selectedIndex / (data.length - 1)) * 100}%, #374151 ${(selectedIndex / (data.length - 1)) * 100}%, #374151 100%)` }}
        />
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

// Enhanced Duty & Tax Education Component
const DutyTaxEducation = ({ dutyText }: { dutyText: string }) => (
  <motion.div 
    className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
        <span className="text-2xl">📋</span>
      </div>
      <h3 className="text-xl font-semibold text-white">Duty & Tax Guide</h3>
    </div>
    <p className="text-gray-300 leading-relaxed">{dutyText}</p>
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h4 className="font-medium text-blue-300 mb-1">Australia Import</h4>
        <p className="text-sm text-gray-400">5% duty + 10% GST on orders >AU$1,000</p>
      </div>
      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <h4 className="font-medium text-purple-300 mb-1">Global Average</h4>
        <p className="text-sm text-gray-400">10-25% VAT/GST varies by country</p>
      </div>
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
        Cubic Weight = Length × Width × Height ÷ 5000
      </div>
      <p className="text-sm text-gray-400 mt-2">Carriers charge for whichever is higher: actual weight or cubic weight</p>
    </div>
  </motion.div>
);

// Warehouse Cost Analysis Component
const WarehouseCostAnalysis = ({ warehouseCosts }: { warehouseCosts: string }) => (
  <motion.div 
    className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
        <span className="text-2xl">🏭</span>
      </div>
      <h3 className="text-xl font-semibold text-white">Warehouse Cost Analysis</h3>
    </div>
    <p className="text-gray-300 leading-relaxed mb-4">{warehouseCosts}</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <h4 className="font-medium text-indigo-300 mb-1">VIC (Cheapest)</h4>
        <p className="text-sm text-gray-400">AU$16.43/pallet/month</p>
      </div>
      <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <h4 className="font-medium text-indigo-300 mb-1">National Median</h4>
        <p className="text-sm text-gray-400">AU$18.82/pallet/month</p>
      </div>
      <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <h4 className="font-medium text-indigo-300 mb-1">WA (Highest)</h4>
        <p className="text-sm text-gray-400">AU$20.04/pallet/month</p>
      </div>
    </div>
  </motion.div>
);

// Enhanced Carrier Recommendation Component
const CarrierRecommendation = ({ carrierHeadline, carrierTip }: { carrierHeadline: string; carrierTip: string }) => {
  // Extract carrier type and determine appropriate badges
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
    
    if (headline.toLowerCase().includes('economy') || headline.toLowerCase().includes('epacket')) {
      badges.push({
        text: "Cost-Effective",
        bgColor: "bg-green-500/20",
        textColor: "text-green-300",
        borderColor: "border-green-500/30"
      });
    }
    
    if (headline.toLowerCase().includes('cubic')) {
      badges.push({
        text: "Cubic Weight",
        bgColor: "bg-purple-500/20",
        textColor: "text-purple-300",
        borderColor: "border-purple-500/30"
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

// Enhanced Inventory Analysis Component  
const InventoryAnalysis = ({ invAlertText }: { invAlertText: string }) => (
  <motion.div 
    className="glass-morphism p-6 rounded-3xl border border-gray-700/50 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.9 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
        <span className="text-2xl">📦</span>
      </div>
      <h3 className="text-xl font-semibold text-white">Inventory Turnover Analysis</h3>
    </div>
    <p className="text-gray-300 leading-relaxed">{invAlertText}</p>
    
    <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
      <p className="text-sm text-purple-300">💡 Industry Benchmark: 6-12 annual turns is considered healthy for most ecommerce businesses.</p>
    </div>
  </motion.div>
);

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center bg-motion bg-bottom-glow bg-top-stars">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto" style={{ borderColor: '#6BE53D' }}></div>
          <p className="mt-4 text-xl">Analyzing your results...</p>
        </div>
      </div>
    );
  }

  if (!result || !quizAnswers) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
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
  const readinessScore = calcReadiness(quizAnswers);
  const speedGainDays = SPEED_GAIN_DAYS[page_id.toUpperCase().replace('_', '_')] || 0;
  const quickTip = QUICK_TIPS[quizAnswers.biggest_shipping_problem] || "Audit your pick-pack process once a month to spot easy wins.";
  const packagingCost = (page_id === 'DIY_PAGE' || page_id === 'AUS1_PAGE') ? calcPackagingCost(quizAnswers, content.monthly_orders) : null;
  const showReturnsAlert = quizAnswers.category && RETURNS_RISK_CATEGORIES.has(quizAnswers.category) && page_id !== 'DIY_PAGE';
  const savingsSliderData = page_id !== 'DIY_PAGE' ? buildSavingsSliderData(content.savings_per_order, content.monthly_orders) : null;
  const showCheatSheet = page_id === 'CN_PAGE';
  const showGearList = page_id === 'DIY_PAGE';
  const showMigrationTimeline = page_id === 'AUS1_PAGE' || page_id === 'AUS_MULTI_PAGE';
  const calendlySuffix = CALENDLY_SUFFIX[page_id.toUpperCase().replace('_', '_')] || '';

  // Extract all the enhanced insights from the result
  const shippingHealth = extractInsight(result.rendered_page, 'ship_health') || 75;
  const co2Text = extractInsight(result.rendered_page, 'co2_text') || '';
  const dutyText = extractInsight(result.rendered_page, 'duty_text') || '';
  const marginAlertText = extractInsight(result.rendered_page, 'margin_alert_text') || '';
  const invAlertText = extractInsight(result.rendered_page, 'inv_alert_text') || '';
  const carrierHeadline = extractInsight(result.rendered_page, 'carrier_headline') || '';
  const carrierTip = extractInsight(result.rendered_page, 'carrier_tip') || '';
  const weightEducation = extractInsight(result.rendered_page, 'weight_education') || '';
  const warehouseCosts = extractInsight(result.rendered_page, 'warehouse_costs') || '';
  const caseStudy = extractInsight(result.rendered_page, 'case_study') || '';

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden bg-motion bg-bottom-glow bg-top-stars">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 pt-safe-top pb-safe-bottom">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-8 sm:mb-12 mt-12 sm:mt-16"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {content.firstname} - Your Quiz Results Are In
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

        {/* Enhanced Insights Section */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ShippingHealthScore score={shippingHealth} marginAlert={marginAlertText} />
          <CO2Impact co2Text={co2Text} />
        </div>

        {/* Enhanced Educational Components */}
        <CarrierRecommendation carrierHeadline={carrierHeadline} carrierTip={carrierTip} />
        
        <WeightPricingEducation weightEducation={weightEducation} />
        
        <WarehouseCostAnalysis warehouseCosts={warehouseCosts} />
        
        <CaseStudy caseStudy={caseStudy} />
        
        <DutyTaxEducation dutyText={dutyText} />
        
        <InventoryAnalysis invAlertText={invAlertText} />

        {/* Readiness Assessment */}
        <ProgressBar score={readinessScore} />

        {/* Gear List (DIY only) */}
        {showGearList && <GearList monthlyOrders={content.monthly_orders} />}

        {/* Migration Timeline (AUS pages) */}
        {showMigrationTimeline && <MigrationTimeline monthlyOrders={content.monthly_orders} />}

        {/* Packaging Cost */}
        {packagingCost && <PackagingCost cost={packagingCost} />}

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

        {/* Quick Tip */}
        <QuickTip tip={quickTip} />

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
            className="text-center"
          >
            <a 
              href={"https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ" + calendlySuffix}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-button text-white font-semibold text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full inline-block mb-4 sm:mb-6"
            >
              👉 Get a Quote
            </a>
            
            <div>
              <Link href="/" className="text-sm sm:text-base transition-colors" style={{ color: '#6BE53D' }}>
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 