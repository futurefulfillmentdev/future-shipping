// TypeScript module for Future Fulfillment Quiz Logic and Result Generation

interface QuizFormAnswers {
  full_name: string;
  email: string;
  phone: string;
  website_url: string;
  products: string;                    // Array joined as string
  package_weight_choice: string;       // e.g. "1 kg – 2 kg"
  package_size_choice: string;         // e.g. "Medium (shoebox)"
  volume_range: string;       // e.g. "500 – 1 000"
  customer_location_choice: string;    // e.g. "Mostly AU, some international"
  current_shipping_method: string;     // e.g. "Home / garage"
  biggest_shipping_problem: string;
  sku_range_choice: string;           // e.g. "101-300"
  delivery_expectation_choice: string;
  shipping_cost_choice: string;       // e.g. "$5-$10"
  category?: string;                 // Optional product category for return risk analysis
}

type FulfillmentDecision = "DIY" | "AUS_3PL" | "AUS_MULTI" | "CHINA_3PL";

// Decision logic based on logic.md
function decideFulfillmentOption(answers: QuizFormAnswers): FulfillmentDecision {
  // Extract monthly order count
  const orderMapping: Record<string, number> = {
    "Under 100": 100,
    "100 – 300": 300,
    "300 – 500": 500,
    "500 – 1 000": 800,
    "1 000 – 2 000": 2000,
    "2 000+": 2500
  };
  // Existing & new helper values
  const monthlyOrders = orderMapping[answers.volume_range] || 0;
  const isFromChina = (answers.current_shipping_method || "").toLowerCase().includes("china");
  const isGlobalFocus = answers.customer_location_choice?.includes("international");
  const skuCount = parseSkuCount(answers);
  const fastDeliveryExpect = (answers.delivery_expectation_choice || "").startsWith("Same");

  // Extract SKU count
  const skuMapping: Record<string, number> = {
    "1-25": 25,
    "26-100": 100,
    "101-300": 300,
    "300+": 600
  };
  const avgWeight = parseWeight(answers);

  // Check if manufacturing/shipping from China
  // const isFromChina = answers.current_shipping_method.toLowerCase().includes("china");

  // Check shipping destination focus
  // const isGlobalFocus = answers.customer_location_choice.includes("international") && 
  //                      !answers.customer_location_choice.includes("Mostly AU");

  // Extract weight for China 3PL consideration
  const weightMapping: Record<string, number> = {
    "Under 0.5 kg": 0.25,
    "0.5 kg – 1 kg": 0.75,
    "1 kg – 2 kg": 1.5,
    "2 kg – 5 kg": 3.5,
    "Over 5 kg": 6.0
  };
  // const avgWeight = weightMapping[answers.package_weight_choice] || 1.5;

  // Primary decision logic from logic.md
  
  // DIY threshold
  if (monthlyOrders < 500) {
    return "DIY";
  }

  // China 3PL only when shipping/manufacturing from China AND >=500/mo.
  // If parcels are heavy (>5kg), localize to AUS 3PL to avoid high intl fees.
  if (isFromChina && monthlyOrders >= 500) {
    return avgWeight > 5 ? "AUS_3PL" : "CHINA_3PL";
  }

  // Majority global shipments without China origin → default to AUS 3PL (global-capable)
  if (isGlobalFocus && monthlyOrders >= 500 && !isFromChina) {
    return "AUS_3PL";
  }

  // Fast delivery expectation (<2 days) should push to multi-state where possible
  if (fastDeliveryExpect && monthlyOrders >= 500 && !isGlobalFocus) {
    return skuCount > 500 ? "AUS_3PL" : "AUS_MULTI";
  }

  // 500–2000 orders, AUS-centric
  if (monthlyOrders >= 500 && monthlyOrders < 2000 && !isGlobalFocus) {
    return "AUS_3PL";
  }

  // ≥2000 orders, AUS focus – but respect SKU complexity
  if (monthlyOrders >= 2000 && !isGlobalFocus) {
    return skuCount > 500 ? "AUS_3PL" : "AUS_MULTI";
  }

  // Fallback
  return "AUS_3PL";
}

// Calculate savings based on logic.md pricing
function calculateSavings(decision: FulfillmentDecision, answers: QuizFormAnswers): {
  savings_per_order: number;
  monthly_orders: number;
  total_monthly_savings: number;
} {
  const orderMapping: Record<string, number> = {
    "Under 100": 100,
    "100 – 300": 300,
    "300 – 500": 500,
    "500 – 1 000": 800,
    "1 000 – 2 000": 2000,
    "2 000+": 2500
  };
  const monthlyOrders = orderMapping[answers.volume_range] || 100;

  let savingsPerOrder = 0;

  switch (decision) {
    case "DIY":
      // Small efficiency gains from OMS/tools
      savingsPerOrder = 0.5;
      break;

    case "AUS_3PL": {
      // AUS to AUS ranges
      // 500–2000 → up to $3/order, 2000+ → up to $4/order
      savingsPerOrder = monthlyOrders >= 2000 ? 4 : 3;
      break;
    }

    case "AUS_MULTI":
      // 2000+ orders → up to $4/order
      savingsPerOrder = 4;
      break;

    case "CHINA_3PL": {
      // China to Global weight tiers
      const w = parseWeight(answers);
      if (w < 1) savingsPerOrder = 10; // <1kg
      else if (w <= 2) savingsPerOrder = 7; // 1–2kg
      else savingsPerOrder = 4; // >2kg
      break;
    }
  }

  return {
    savings_per_order: savingsPerOrder,
    monthly_orders: monthlyOrders,
    total_monthly_savings: savingsPerOrder * monthlyOrders
  };
}

// Get content for each result type based on result.md
function getResultContent(decision: FulfillmentDecision, firstname: string, savings: any) {
  const baseContent = {
    firstname,
    ...savings
  };

  switch (decision) {
    case "DIY":
      return {
        ...baseContent,
        title: "You're Best Off Shipping Orders Yourself (For Now)",
        description: `At your current volume, using a 3PL would add unnecessary cost and complexity.\nIf you're shipping under 500 orders/month, in-house fulfillment is your smartest move right now.\n\nThat said, a few simple upgrades can help you save time and cut costs:`,
        benefits: [
          "Use Starshipit, Shippit, or ShipStation to automate labels and access cheaper rates",
          "Get a label printer and satchels from a local supplier", 
          "Tighten your packaging to reduce cubic weight and avoid carrier penalties",
          "Start tracking your cost-per-order and fulfilment time"
        ],
        ctaTitle: "🎁 Get Our Free Fulfillment Toolkit",
        ctaText: "Streamline your process and improve your margins with our proven DIY setup guide.",
        ctaUrl: "https://j63rzjzdahixjfu3foqc.app.clientclub.net/communities/groups/ecommerce-insiders-academy/home?invite=67b1bb500ca4a3bf1bba9912",
        note: "(Just by switching to OMS tools and optimizing packaging)"
      };

    case "AUS_3PL":
      return {
        ...baseContent,
        title: "You’re Ready to Scale with a 3PL in Australia",
        description: `You’ve Outgrown DIY Fulfillment. It’s Time to Outsource and Reclaim Your Time.\n\nWith 500+ orders/month, packing orders yourself is capping your growth.\nA dedicated Future Fulfillment warehouse will help you scale — without losing control of the customer experience.\n\nHere’s what you get:`,
        benefits: [
          "Discounted rates via AusPost and other leading carriers",
          "Barcode-based inventory, returns management & live tracking",
          "Hours back in your week to focus on marketing, growth, and ops",
          "We help you maintain your brand — with custom packaging, eco-options, gift wrapping, and thoughtful inserts"
        ],
        ctaTitle: "📞 Book Your Free Fulfillment Strategy Call",
        ctaText: "We'll show you how to transition smoothly and start saving within days.",
        ctaUrl: "https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ",
        note: null
      };

    case "AUS_MULTI":
      return {
        ...baseContent,
        title: "You’re Ready for Multi-Warehouse Fulfillment in Australia",
        description: `With 2,000+ orders/month shipping across multiple states, central fulfillment is slowing you down and costing you more.\n\nHere’s what you unlock with Future Fulfillment’s VIC, NSW, and QLD warehouses:`,
        benefits: [
          "Faster delivery — same-day and next-day shipping in key regions",
          "Lower shipping costs — save up to 30% on cross-state orders",
          "Smarter inventory management — spread stock and reduce delays",
          "Better customer experience — fewer complaints, faster replacements, higher reviews"
        ],
        ctaTitle: "📞 Book Your Free Fulfillment Strategy Call",
        ctaText: "We'll map your inventory and show you exactly how much you'll save.",
        ctaUrl: "https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ",
        note: "(From reduced shipping fees and faster delivery)"
      };

    case "CHINA_3PL":
      return {
        ...baseContent,
        title: "China-Based Fulfillment Is Your Most Profitable Path",
        description: `You’re manufacturing in China and shipping globally — it’s time to fulfill direct from the source.\n\nHere’s what you get:`,
        benefits: [
          "$1 warehouse fees and global shipping from as low as $5 per order",
          "Fast delivery to the US, UK, EU, and more — via optimized global lines",
          "Full product handling — QC, polybagging, swing tags, labelling & inserts",
          "Access to 5+ dedicated line types for apparel, batteries, cosmetics, express, and sensitive goods"
        ],
        ctaTitle: "📞 Book Your Free Fulfillment Strategy Call", 
        ctaText: "We'll show you how to optimize your global shipping strategy.",
        ctaUrl: "https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ",
        note: "Note: China-based fulfillment has limited returns handling. If >10% of orders are returned or you need hassle-free exchanges, use AUS 3PL for returns."
      };

    default:
      return baseContent;
  }
}

// Universal bottom section from result-bottom.md
const UNIVERSAL_BOTTOM_SECTION = {
  title: "Our Clients Are Shipping 3+ Million Orders Every Year",
  description: `We work with hundreds of leading Aussie and Kiwi brands to help them scale to new heights.
Our warehouse teams are an extension of your team, and we pride ourselves on providing best-in-class customer support.`,
  testimonials: [
    {
      quote: "Working with Future feels like having our very own warehouse - they deliver exceptional support",
      author: "Manny Barbas, Sascha Therese"
    },
    {
      quote: "I was no longer packing orders from morning to night, instead I could really focus on marketing", 
      author: "Justin Clacher, 4WD Detail"
    },
    {
      quote: "I would recommend Future to anyone that has a growing ecommerce business",
      author: "Drew Baird, Health & Balance Vitamins"
    },
    {
      quote: "Future saved us over $2 per order, significantly boosting our profits - It's been a game changer",
      author: "Gretta Van Riel, SMT"
    }
  ]
};

/****************************************************************************************
 * NEW ENHANCED INSIGHT MODULES
 ****************************************************************************************/

// Static lookup data


const GEAR_LISTS: Record<"low" | "mid" | "high", string[]> = {
  low: [
    "Dymo 4XL thermal label printer",
    "1000 × 500 mm bubble-wrap roll"
  ],
  mid: [
    "Zebra ZT230 industrial printer",
    "Handheld barcode scanner"
  ],
  high: [
    "Automated carton sealer",
    "Powered conveyor bench",
    "Warehouse mobile work-station"
  ]
};

const SATCHEL_PRICES: Record<"S" | "M" | "L" | "XL", number> = {
  S: 0.6,
  M: 0.9,
  L: 1.3,
  XL: 1.7
};



const SPEED_GAIN_DAYS: Record<FulfillmentDecision, number> = {
  DIY: 0,
  AUS_3PL: 1,
  AUS_MULTI: 2,
  CHINA_3PL: 3
};

const CALENDLY_SUFFIX: Record<FulfillmentDecision, string> = {
  DIY: "?topic=diy",
  AUS_3PL: "?topic=aus1",
  AUS_MULTI: "?topic=ausmulti",
  CHINA_3PL: "?topic=cn"
};

const RETURNS_RISK_CATEGORIES = new Set(["Clothing & Accessories", "Tech & Electronics"]);

// Enhanced CO2 factors (UK Government 2024 emission factors - kg CO2 per tonne-km)
const CO2_FACTORS = {
  AUS_DOM: 0.025,      // kg CO2 per tonne-km (domestic truck/rail)
  AUS_INTL_AIR: 0.606, // kg CO2 per tonne-km (long-haul air freight)
  AUS_INTL_SEA: 0.015, // kg CO2 per tonne-km (container ship)
  CN_GLOBAL_AIR: 1.316, // kg CO2 per tonne-km (short-haul international air)
  CN_GLOBAL_SEA: 0.011  // kg CO2 per tonne-km (bulk carrier)
};

// Warehouse cost data (2024 research - AUD per pallet per month)
const WAREHOUSE_COSTS = {
  AU_NATIONAL_MEDIAN: 18.82,
  AU_VIC: 16.43,  // Cheapest
  AU_NSW: 19.50,
  AU_QLD: 18.17,
  AU_WA: 20.04,   // Most expensive
  AU_SA: 19.90,
  US_AVERAGE: 20.17,
  CN_AVERAGE: 12.50
};

// NEW: Carrier recommendation matrix
interface CarrierReco {
  id: string;
  lane: "AUS_DOM" | "AUS_INTL" | "CN_GLOBAL";
  weight_max: number;
  headline: string;
  tip: string;
}

const CARRIER_MATRIX: CarrierReco[] = [
  // AUS_DOM - Enhanced with cubic weight education
  { id: "auspost_cubic", lane: "AUS_DOM", weight_max: 2, headline: "Australia Post eParcel", tip: "Uses cubic weight (L(cm) x W(cm) x H(cm)) / 4,000 vs actual weight. Ideal for light, bulky items. Optimize packaging to reduce cubic weight." },
  { id: "startrack_express", lane: "AUS_DOM", weight_max: 5, headline: "StarTrack Express", tip: "Best for 2-5kg items with next-day metro delivery. Volume discounts available for 500+ parcels/month." },
  { id: "tnt_express", lane: "AUS_DOM", weight_max: Infinity, headline: "TNT Express", tip: "Premium same-day and next-day service in major cities. Real-time tracking and proof of delivery." },
  
  // AUS_INTL - Enhanced with duty information
  { id: "dhl_express", lane: "AUS_INTL", weight_max: 2, headline: "DHL Express Worldwide", tip: "Fastest international delivery (1-3 days) with excellent tracking. DDP service available to handle duties/taxes." },
  { id: "auspost_intl", lane: "AUS_INTL", weight_max: 5, headline: "Australia Post International Economy", tip: "Most cost-effective for high-volume international. 7-20 business days. Good coverage to 190+ countries." },
  { id: "fedex_priority", lane: "AUS_INTL", weight_max: Infinity, headline: "FedEx International Priority", tip: "Reliable 1-3 day delivery with strong tracking. Good for urgent international shipments." },
  
  // CN_GLOBAL - Enhanced with compliance information
  { id: "sf_express", lane: "CN_GLOBAL", weight_max: 1, headline: "SF Express International", tip: "Premium service with 3-8 day delivery (worldwide). Strong compliance for electronics and regulated goods." },
  { id: "china_post", lane: "CN_GLOBAL", weight_max: 2, headline: "China Post ePacket", tip: "Most economical option with 3-8 day delivery (worldwide). Good for low-value items under de minimis thresholds." },
  { id: "dhl_ecommerce", lane: "CN_GLOBAL", weight_max: Infinity, headline: "DHL eCommerce", tip: "Best balance of cost and speed with 3-8 day delivery (worldwide). Excellent for consolidated shipments and bulk orders." }
];

// Helper functions
function clamp(num: number, min: number, max: number) { return Math.max(min, Math.min(num, max)); }

function parseSkuCount(answers: QuizFormAnswers): number {
  const skuMapping: Record<string, number> = {
    "1-25": 25,
    "26-100": 100,
    "101-300": 300,
    "300+": 500  // More conservative estimate for 300+ range
  };
  return skuMapping[answers.sku_range_choice] || 100;
}

function parseWeight(answers: QuizFormAnswers): number {
  const weightMapping: Record<string, number> = {
    "Under 0.5 kg": 0.25,
    "0.5 kg – 1 kg": 0.75,
    "1 kg – 2 kg": 1.5,
    "2 kg – 5 kg": 3.5,
    "Over 5 kg": 6.0
  };
  return weightMapping[answers.package_weight_choice] || 1.5;
}

function getLane(answers: QuizFormAnswers, decision: FulfillmentDecision): "AUS_DOM" | "AUS_INTL" | "CN_GLOBAL" {
  if (decision === "CHINA_3PL") return "CN_GLOBAL";
  if (answers.customer_location_choice.includes("international")) return "AUS_INTL";
  return "AUS_DOM";
}

// NEW: Shipping Health Score
function calcShippingHealth(answers: QuizFormAnswers, decision: FulfillmentDecision): number {
  let score = 85; // Start with a more realistic baseline
  
  // Shipping cost impact (major factor)
  if (answers.shipping_cost_choice === "Over $20 per order") {
    score -= 30;
  } else if (answers.shipping_cost_choice === "$15-$20 per order") {
    score -= 20;
  } else if (answers.shipping_cost_choice === "$10-$15 per order") {
    score -= 10;
  } else if (answers.shipping_cost_choice === "$5-$10 per order") {
    score += 5; // Good cost efficiency
  } else if (answers.shipping_cost_choice === "Under $5 per order") {
    score += 10; // Excellent cost efficiency
  }
  
  // Delivery expectations vs capability mismatch
  if (answers.delivery_expectation_choice === "Same / next day") {
    if (decision === "AUS_MULTI") {
      score += 5; // Can deliver on expectations
    } else if (decision === "AUS_3PL") {
      score -= 10; // Challenging but possible
    } else {
      score -= 25; // Very difficult to achieve
    }
  } else if (answers.delivery_expectation_choice === "2-3 days") {
    score += 5; // Reasonable expectations
  }
  
  // SKU complexity impact
  const skuCount = parseSkuCount(answers);
  if (skuCount >= 500) {
    score -= 20; // Very complex inventory management
  } else if (skuCount >= 300) {
    score -= 15; // High complexity
  } else if (skuCount >= 100) {
    score -= 8; // Moderate complexity
  } else if (skuCount <= 25) {
    score += 5; // Simple to manage
  }
  
  // Current shipping method efficiency
  const currentMethod = answers.current_shipping_method.toLowerCase();
  if (currentMethod.includes("home") || currentMethod.includes("garage")) {
    score -= 15; // Inefficient for scaling
  } else if (currentMethod.includes("china")) {
    if (decision === "CHINA_3PL") {
      score += 5; // Good alignment
    } else {
      score -= 10; // Misalignment with recommendation
    }
  } else if (currentMethod.includes("3pl") || currentMethod.includes("warehouse")) {
    score += 10; // Already optimized
  }
  
  // Package optimization - Enhanced logic
  const weight = parseWeight(answers);
  const packageSize = answers.package_size_choice.toLowerCase();
  
  // Severe mismatches (major inefficiency)
  if (packageSize.includes("very large") && weight < 1.5) {
    score -= 20; // Very poor packaging efficiency (huge box for tiny item)
  } else if (packageSize.includes("large") && weight < 0.75) {
    score -= 15; // Poor packaging efficiency
  } else if (packageSize.includes("small") && weight > 3) {
    score -= 12; // Undersized packaging (safety/damage risk)
  } 
  // Good matches (efficiency bonus)
  else if ((packageSize.includes("small") && weight <= 1) ||
           (packageSize.includes("medium") && weight >= 1 && weight <= 3) ||
           (packageSize.includes("large") && weight >= 2 && weight <= 5)) {
    score += 8; // Excellent packaging efficiency
  }
  // Moderate mismatches
  else if (packageSize.includes("medium") && (weight < 0.5 || weight > 4)) {
    score -= 5; // Slight packaging inefficiency
  }
  
  // Shipping problems impact
  // Normalize quiz problem labels to internal categories
  const problemRaw = (answers.biggest_shipping_problem || "").toLowerCase();
  let problem: "cost" | "speed" | "returns" | "time" | "intl" | "tracking" | "other" = "other";
  if (problemRaw.includes("cost")) problem = "cost";
  else if (problemRaw.includes("slow") || problemRaw.includes("delivery")) problem = "speed";
  else if (problemRaw.includes("return")) problem = "returns";
  else if (problemRaw.includes("time")) problem = "time";
  else if (problemRaw.includes("international")) problem = "intl";
  else if (problemRaw.includes("track")) problem = "tracking";

  if (problem === "cost") {
    score -= 10; // Already factored in cost, but compounds the issue
  } else if (problem === "speed") {
    score -= 8;
  } else if (problem === "returns") {
    score -= 12;
  } else if (problem === "intl") {
    score -= 10;
  } else if (problem === "time") {
    score -= 6;
  } else if (problem === "tracking") {
    score -= 5;
  } else {
    score -= 6;
  }
  
  // Customer location complexity - Enhanced
  if (answers.customer_location_choice.includes("international")) {
    if (answers.customer_location_choice.includes("Mostly AU")) {
      score -= 5; // Some complexity
      // Additional penalty if heavy items going international
      if (weight > 2) {
        score -= 5; // Heavy international shipping is expensive
      }
    } else if (answers.customer_location_choice.includes("Mostly international")) {
      score -= 15; // High complexity for global shipping
      // Compound with delivery expectations
      if (answers.delivery_expectation_choice === "Same / next day") {
        score -= 8; // Nearly impossible for international
      }
    }
  } else {
    score += 5; // Domestic focus is much simpler
  }
  
  // Volume vs decision alignment bonus/penalty
  const monthlyOrders = calculateSavings(decision, answers).monthly_orders;
  if (decision === "DIY" && monthlyOrders > 500) {
    score -= 15; // DIY not optimal for high volume
  } else if (decision === "AUS_MULTI" && monthlyOrders < 1500) {
    score -= 10; // Multi-state overkill for lower volume
  } else if ((decision === "AUS_3PL" || decision === "CHINA_3PL") && 
             monthlyOrders >= 500 && monthlyOrders <= 2000) {
    score += 8; // Sweet spot for 3PL
  }
  
  // Return complexity factor (new)
  if (problem === "returns") {
    if (answers.customer_location_choice.includes("international")) {
      score -= 8; // International returns are very complex
    }
    if (decision === "DIY") {
      score -= 5; // DIY returns management is time-consuming
    }
  }
  
  return Math.max(35, Math.min(95, score)); // Ensure realistic range 35-95%
}

// Enhanced Duty & Taxes with 2024 research data
function getDutyText(answers: QuizFormAnswers, decision: FulfillmentDecision): string {
  const lane = getLane(answers, decision);
  const weight = parseWeight(answers);
  
  if (lane === "AUS_INTL") {
    return weight <= 2 
      ? "🇦🇺 Import to Australia: De minimis AU$1,000. Above: 5% duty (FOB) + 10% GST (CIF+duty). Processing fee: AU$50-192."
      : "🇦🇺 Heavier parcels (>2kg): May trigger formal customs clearance. Consider keeping shipments under AU$1,000 to avoid duties.";
  }
  
  if (lane === "CN_GLOBAL") {
    return weight <= 2
      ? "🌍 Global shipping: EU/UK VAT ~20% collected via IOSS. US: $800 de minimis. Most countries: 10-25% VAT/GST."
      : "🌍 Over 2kg may trigger formal clearance in EU/UK. Allow extra 2-3 days. Consider sea freight for cost savings.";
  }
  
  return "🇦🇺 Domestic shipping: No import duties. Only GST applies to final sale (10% if registered for GST).";
}

// Enhanced Carbon Footprint calculation with accurate emission factors
function getCO2Text(answers: QuizFormAnswers, decision: FulfillmentDecision): string {
  const lane = getLane(answers, decision);
  const weight = parseWeight(answers);
  
  let co2PerParcel: number;
  let transportMode: string;
  let distance: number;
  
  if (lane === "AUS_DOM") {
    distance = 500; // Average domestic distance in km
    co2PerParcel = weight * CO2_FACTORS.AUS_DOM * distance / 1000; // Convert to kg
    transportMode = "road transport";
  } else if (lane === "AUS_INTL") {
    distance = 2000; // Average international distance in km
    co2PerParcel = weight * CO2_FACTORS.AUS_INTL_AIR * distance / 1000;
    transportMode = "air freight";
  } else {
    distance = 1500; // Average China to global distance in km
    co2PerParcel = weight * CO2_FACTORS.CN_GLOBAL_AIR * distance / 1000;
    transportMode = "air freight";
  }
  
  const seaFreightCO2 = weight * CO2_FACTORS.AUS_INTL_SEA * distance / 1000;
  const savings = ((co2PerParcel - seaFreightCO2) / co2PerParcel * 100).toFixed(0);
  
  return `≈ ${co2PerParcel.toFixed(1)} kg CO₂e per parcel via ${transportMode}. Switch to sea freight for international shipments to reduce emissions by ${savings}% (${seaFreightCO2.toFixed(2)} kg CO₂e).`;
}

// Enhanced Profit-Margin Alert with specific recommendations
function getMarginAlert(answers: QuizFormAnswers): string {
  const shippingCost = answers.shipping_cost_choice;
  const monthlyOrders = calculateSavings("DIY", answers).monthly_orders;
  const skuCount = parseSkuCount(answers);
  
  if (shippingCost === "Over $20 per order") {
    const potentialSavings = monthlyOrders * 8; // Assume $8 savings per order possible
    return `🚨 Critical Alert: Shipping costs over $20/order severely impact margins. At ${monthlyOrders} orders/month, you could save $${potentialSavings.toLocaleString()}/month with optimized fulfillment. Immediate action needed.`;
  }
  
  if (shippingCost === "$15-$20 per order") {
    const currentSpend = monthlyOrders * 17.5;
    const optimizedSpend = monthlyOrders * 12;
    const savings = currentSpend - optimizedSpend;
    return `⚠️ Margin Alert: $17.50 average shipping likely represents 15-20% of AOV. Current monthly spend: $${currentSpend.toLocaleString()}. With optimization: $${optimizedSpend.toLocaleString()} (save $${savings.toLocaleString()}/month).`;
  }
  
  if (shippingCost === "$10-$15 per order") {
    if (skuCount > 300) {
      return "📊 Moderate shipping costs, but high SKU complexity may be inflating costs. Consider SKU rationalization and bulk shipping strategies.";
    } else {
      return "📊 Moderate shipping costs. You're in the acceptable range, but there's room for 10-15% improvement through carrier negotiation.";
    }
  }
  
  if (shippingCost === "$5-$10 per order") {
    if (monthlyOrders > 1000) {
      return "✅ Good shipping efficiency! At your volume, consider negotiating even better rates or exploring multi-carrier strategies for 5-10% additional savings.";
    } else {
      return "✅ Solid shipping costs. Focus on maintaining this efficiency as you scale up volume.";
    }
  }
  
  if (shippingCost === "Under $5 per order") {
    return "🎯 Excellent shipping efficiency! You're in the top 10% for cost optimization. Monitor for any service quality trade-offs as you maintain these rates.";
  }
  
  return "📊 Review your shipping cost structure - accurate cost tracking is essential for margin optimization.";
}

// Enhanced Warehouse Cost Analysis
function getInventoryAlert(answers: QuizFormAnswers): string {
  const monthlyOrders = calculateSavings("DIY", answers).monthly_orders;
  const skuCount = parseSkuCount(answers);
  
  // Estimate pallets needed (assuming 100 orders per pallet)
  const palletsNeeded = Math.ceil(monthlyOrders / 100);
  const warehouseCost = palletsNeeded * WAREHOUSE_COSTS.AU_NATIONAL_MEDIAN;
  
  let insight: string;
  if (skuCount <= 25) {
    insight = `🎯 Low SKU complexity (${skuCount} SKUs). Simple inventory management with minimal carrying costs.`;
  } else if (skuCount <= 100) {
    insight = `📊 Moderate SKU complexity (${skuCount} SKUs). Good balance of variety and manageability.`;
  } else if (skuCount <= 300) {
    insight = `📈 High SKU complexity (${skuCount} SKUs). Consider SKU rationalization to reduce carrying costs.`;
  } else {
    insight = `⚠️ Very high SKU complexity (${skuCount}+ SKUs). High carrying costs - consider reducing slow-moving SKUs or bundling strategies.`;
  }
  
  return `${insight} Estimated warehouse cost: AU$${warehouseCost.toFixed(0)}/month for ${palletsNeeded} pallets based on ${monthlyOrders} orders/month.`;
}

// Add default carrier fallback
const DEFAULT_CARRIER: CarrierReco = {
  id: "AUSPOST_PARCEL_POST",
  lane: "AUS_DOM",
  weight_max: Infinity,
  headline: "AusPost Parcel Post",
  tip: "Safe baseline service when no optimised carrier match is found."
};

// NEW: Carrier Recommendation
function chooseCarrier(answers: QuizFormAnswers, decision: FulfillmentDecision): CarrierReco {
  const lane = getLane(answers, decision);
  const weight = parseWeight(answers);
  
  const candidates = CARRIER_MATRIX.filter(c => c.lane === lane);
  if (candidates.length === 0) return DEFAULT_CARRIER;

  const match = candidates.find(c => weight <= c.weight_max);
  return match || DEFAULT_CARRIER;
}

// NEW: Dead Weight vs Cubic Weight Education
function getWeightPricingEducation(answers: QuizFormAnswers): string {
  const packageSize = answers.package_size_choice.toLowerCase();
  
  // Example calculation for cubic weight
  let dimensions = "30(cm) x 20(cm) x 15(cm)";
  let actualWeight = parseWeight(answers);
  let cubicWeight = (30 * 20 * 15) / 4000; // Updated formula
  
  if (packageSize.includes("small")) {
    dimensions = "25(cm) x 15(cm) x 10(cm)";
    cubicWeight = (25 * 15 * 10) / 4000;
  } else if (packageSize.includes("large")) {
    dimensions = "40(cm) x 30(cm) x 20(cm)";
    cubicWeight = (40 * 30 * 20) / 4000;
  } else if (packageSize.includes("very large")) {
    dimensions = "50(cm) x 40(cm) x 30(cm)";
    cubicWeight = (50 * 40 * 30) / 4000;
  }
  
  const chargeableWeight = Math.max(actualWeight, cubicWeight);
  const savings = cubicWeight > actualWeight ? 
    `You're paying for ${cubicWeight.toFixed(1)}kg cubic weight vs ${actualWeight}kg actual weight. Optimize packaging to save costs.` :
    `Your actual weight (${actualWeight}kg) exceeds cubic weight (${cubicWeight.toFixed(1)}kg) - good packaging efficiency.`;
  
  return `📦 Shipping Weight Education: Carriers charge for "chargeable weight" - the higher of actual vs cubic weight. Example: ${dimensions} package = ${cubicWeight.toFixed(1)}kg cubic weight (L(cm) x W(cm) x H(cm)) / 4,000. ${savings}`;
}

// NEW: Warehouse Cost Comparison
function getWarehouseCostComparison(answers: QuizFormAnswers, decision: FulfillmentDecision): string {
  const monthlyOrders = calculateSavings("DIY", answers).monthly_orders;
  const palletsNeeded = Math.ceil(monthlyOrders / 100);
  
  if (decision === "CHINA_3PL") {
    const auCost = palletsNeeded * WAREHOUSE_COSTS.AU_NATIONAL_MEDIAN;
    const cnCost = palletsNeeded * WAREHOUSE_COSTS.CN_AVERAGE;
    const savings = auCost - cnCost;
    
    return `🏭 Warehouse Cost Analysis: AU 3PL ~AU$${auCost.toFixed(0)}/month vs China 3PL ~AU$${cnCost.toFixed(0)}/month for ${palletsNeeded} pallets. Monthly savings: AU$${savings.toFixed(0)} using international fulfillment.`;
  } else {
    const monthlyCost = palletsNeeded * WAREHOUSE_COSTS.AU_NATIONAL_MEDIAN;
    const cheapestState = `VIC (AU$${WAREHOUSE_COSTS.AU_VIC.toFixed(0)}/pallet)`;
    const expensiveState = `WA (AU$${WAREHOUSE_COSTS.AU_WA.toFixed(0)}/pallet)`;
    
    return `🏭 Australian 3PL Costs: ~AU$${monthlyCost.toFixed(0)}/month for ${palletsNeeded} pallets (national median AU$${WAREHOUSE_COSTS.AU_NATIONAL_MEDIAN}/pallet/month). Cheapest: ${cheapestState}, Most expensive: ${expensiveState}.`;
  }
}

function calcReadiness(answers: QuizFormAnswers): number {
  let score = 100;
  const skuCount = parseSkuCount(answers);
  const shipsFromHome = answers.current_shipping_method.toLowerCase().includes("home") ||
                        answers.current_shipping_method.toLowerCase().includes("garage");
  if (skuCount > 100 && shipsFromHome) score -= 15;
  if (skuCount > 25) score -= 15; // no barcodes implied
  const fromChina = answers.current_shipping_method.toLowerCase().includes("china");
  if (answers.biggest_shipping_problem === "Hard to manage returns" && fromChina) score -= 20;
  if (answers.package_size_choice.toLowerCase().includes("very large")) score -= 10;
  return clamp(score, 0, 100);
}

function mapPackageSize(choice: string): "S" | "M" | "L" | "XL" {
  const lower = choice.toLowerCase();
  if (lower.includes("small")) return "S";
  if (lower.includes("medium")) return "M";
  if (lower.includes("very large")) return "XL";
  return "L";
}

function lookupSatchelPrice(choice: string): number {
  return SATCHEL_PRICES[mapPackageSize(choice)];
}

function calcPackagingCost(answers: QuizFormAnswers, monthlyOrders: number): number {
  const price = lookupSatchelPrice(answers.package_size_choice);
  return Math.round(price * monthlyOrders);
}

function nextOrderCeiling(currentOrders: number): number {
  if (currentOrders <= 100) return 300;
  if (currentOrders <= 300) return 500;
  if (currentOrders <= 500) return 1000;
  if (currentOrders <= 1000) return 2000;
  if (currentOrders <= 2000) return 2500;
  return currentOrders;
}

function buildSavingsSliderData(savingsPerOrder: number, currentOrders: number): { orders: number; monthly_saving: number }[] {
  const ceiling = nextOrderCeiling(currentOrders);
  const data: { orders: number; monthly_saving: number }[] = [];
  for (let o = currentOrders; o <= ceiling; o += 250) {
    data.push({ orders: o, monthly_saving: Math.round(o * savingsPerOrder) });
  }
  if (data[data.length - 1].orders !== ceiling) {
    data.push({ orders: ceiling, monthly_saving: Math.round(ceiling * savingsPerOrder) });
  }
  return data;
}

function renderArray(list: string[], tag: "ul" | "ol" = "ul"): string {
  const li = list.map(item => `<li>${item}</li>`).join("\n");
  return `<${tag}>${li}</${tag}>`;
}

function renderPage(decision: FulfillmentDecision, content: any, extras: Record<string, any>) {
  const {
    readiness_score_pct = 0,
    speed_gain_days = 0,
    gear_list = null,

    returns_risk_alert = null,
    savings_slider_data = null,
    cheatsheet_link = null,
    calendly_suffix = "",
    // NEW enhanced insights
    ship_health = 0,
    duty_text = "",
    co2_text = "",
    margin_alert_text = "",
    inv_alert_text = "",
    carrier_headline = "",
    carrier_tip = "",
    weight_education = "",
    warehouse_costs = "",
    confidence_level = null,
    assumptions = []
  } = extras;

  // Hero
  let html = `<section class="hero"><h1>${content.title}</h1><p>${content.description}</p>
  <div class="progress"><div class="bg-[#6BE53D]" style="width: ${readiness_score_pct}%"></div></div>
  <p>You're ${readiness_score_pct}% ready for smooth fulfilment.</p></section>`;

  // Benefits
  html += renderArray(content.benefits);

  // Speed badge
  if (speed_gain_days > 0) {
    html += `<span class="badge bg-[#6BE53D] text-white">Speed Gain: −${speed_gain_days} days</span>`;
  }

  // Note
  if (content.note) {
    html += `<p>${content.note}</p>`;
  }

  // Gear list (DIY only)
  if (gear_list) {
    html += `<h3>Recommended Gear</h3>` + renderArray(gear_list);
  }





  // Returns risk alert
  if (returns_risk_alert) {
    html += `<p><strong>Heads up:</strong> ${returns_risk_alert}</p>`;
  }



  // NEW: Enhanced insights section
  html += `<div class="score-box">
    <h4>Shipping Health: ${ship_health}%</h4>
    <progress value="${ship_health}" max="100"></progress>
    ${margin_alert_text ? `<p class="margin-alert">${margin_alert_text}</p>` : ''}
  </div>`;

  if (duty_text) {
    html += `<div class="duty-box">${duty_text}</div>`;
  }

  html += `<div class="co2-box">${co2_text}</div>`;

  if (inv_alert_text) {
    html += `<div class="inv-box">${inv_alert_text}</div>`;
  }

  html += `<div class="carrier-box"><strong>Best Carrier:</strong> ${carrier_headline}<br/>${carrier_tip}</div>`;

  // Weight pricing education
  html += `<div class="weight-education-box">${weight_education}</div>`;

  // Warehouse cost comparison
  html += `<div class="warehouse-cost-box">${warehouse_costs}</div>`;

  // Savings slider data (as JSON script for front-end usage)
  if (savings_slider_data) {
    html += `<script type="application/json" id="savingsData">${JSON.stringify(savings_slider_data)}</script>`;
  }

  // CTA
  html += `<a href="${content.ctaUrl}${calendly_suffix}" class="btn bg-[#6BE53D] text-white border-none hover:bg-[#57c433]">${content.ctaTitle}</a><p>${content.ctaText}</p>`;

  // Cheat-sheet button
  if (cheatsheet_link) {
    html += `<a href="${cheatsheet_link}" class="btn btn-outline border-[#6BE53D] text-[#6BE53D] hover:bg-[#6BE53D] hover:text-white">Download Customs & Duties Cheat-Sheet</a>`;
  }

  // Universal footer
  if (confidence_level) {
    html += `<div class="confidence-banner"><strong>Confidence:</strong> ${confidence_level}${assumptions.length ? `<br/>Assumptions: ${assumptions.join('; ')}` : ''}</div>`;
  }
  html += `<footer><h3>${UNIVERSAL_BOTTOM_SECTION.title}</h3><p>${UNIVERSAL_BOTTOM_SECTION.description}</p>${renderArray(UNIVERSAL_BOTTOM_SECTION.testimonials.map(t=>`"${t.quote}" — ${t.author}`))}</footer>`;

  return html;
}

// NEW helper to derive confidence level based on how many default mappings we used
function deriveConfidence(answers: QuizFormAnswers): { level: "High" | "Medium" | "Low"; assumptions: string[] } {
  const assumptions: string[] = [];
  let penalty = 0;
  if (!answers.website_url) { assumptions.push("Website URL missing – used generic product segment averages"); penalty += 1; }
  if (!answers.category) { assumptions.push("Product category not provided – returns risk estimated"); penalty += 1; }
  if (answers.volume_range === "Under 100" || answers.volume_range === "2 000+") {
    assumptions.push("Monthly order range very broad – savings calculated with midpoint");
    penalty += 1;
  }
  const level = penalty === 0 ? "High" : penalty === 1 ? "Medium" : "Low";
  return { level, assumptions };
}

// ---------------------
// Public API (unchanged): returns { page_id, rendered_page }
// ---------------------

export function generateResult(form: QuizFormAnswers): { page_id: string; rendered_page: string; content: any; universalSection: typeof UNIVERSAL_BOTTOM_SECTION } {
  // Core decisions & reusable data
  const decision = decideFulfillmentOption(form);
  const savings = calculateSavings(decision, form);
  const firstname = form.full_name.split(" ")[0] || "Friend";
  const content = getResultContent(decision, firstname, savings);

  // Derived insights
  const readiness_score_pct = calcReadiness(form);
  const speed_gain_days = SPEED_GAIN_DAYS[decision];


  // Gear list (DIY)
  let gear_list: string[] | null = null;
  const monthlyOrders = savings.monthly_orders;
  if (decision === "DIY") {
    const band = monthlyOrders < 300 ? "low" : monthlyOrders <= 500 ? "mid" : "high";
    gear_list = GEAR_LISTS[band];
  }





  // Returns risk alert
  const returns_risk_alert = form.category && RETURNS_RISK_CATEGORIES.has(form.category) ?
    "Products in this category see return rates above 20%. Tighten QC and offer hassle-free exchanges to stay ahead." : null;

  // Savings slider data (not for DIY)
  let savings_slider_data: { orders: number; monthly_saving: number }[] | null = null;
  if (decision !== "DIY") {
    savings_slider_data = buildSavingsSliderData(savings.savings_per_order, monthlyOrders);
  }

  // Cheat-sheet link for CN page
  const cheatsheet_link = decision === "CHINA_3PL" ? "https://futurefulfilment.com/global-tax-guide.pdf" : null;

  const calendly_suffix = CALENDLY_SUFFIX[decision];

  // NEW: Enhanced insights with educational content
  const ship_health = calcShippingHealth(form, decision);
  const duty_text = getDutyText(form, decision);
  const co2_text = getCO2Text(form, decision);
  const margin_alert_text = getMarginAlert(form);
  const inv_alert_text = getInventoryAlert(form);
  const carrier = chooseCarrier(form, decision);
  const weight_education = getWeightPricingEducation(form);
  const warehouse_costs = getWarehouseCostComparison(form, decision);

  // NEW helper to derive confidence level based on how many default mappings we used
  const { level: confidence_level, assumptions } = deriveConfidence(form);

  // Render full HTML page
  const rendered_page = renderPage(decision, content, {
    readiness_score_pct,
    speed_gain_days,
    gear_list,
    returns_risk_alert,
    savings_slider_data,
    cheatsheet_link,
    calendly_suffix,
    // NEW enhanced insights
    ship_health,
    duty_text,
    co2_text,
    margin_alert_text,
    inv_alert_text,
    carrier_headline: carrier.headline,
    carrier_tip: carrier.tip,
    weight_education,
    warehouse_costs,
    confidence_level,
    assumptions
  });

  const PAGE_ID_MAP: Record<FulfillmentDecision, string> = {
    DIY: "DIY_PAGE",
    AUS_3PL: "AUS1_PAGE",
    AUS_MULTI: "AUS_MULTI_PAGE",
    CHINA_3PL: "CN_PAGE"
  };
  
  return {
    page_id: PAGE_ID_MAP[decision],
    rendered_page,
    // legacy fields for compatibility with front-end components
    content,
    universalSection: UNIVERSAL_BOTTOM_SECTION
  };
} 