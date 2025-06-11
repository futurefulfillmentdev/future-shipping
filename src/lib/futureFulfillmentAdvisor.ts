// TypeScript module for Future Fulfillment Quiz Logic and Result Generation

interface QuizFormAnswers {
  full_name: string;
  email: string;
  phone: string;
  website_url: string;
  products: string;                    // Array joined as string
  package_weight_choice: string;       // e.g. "1 kg – 2 kg"
  package_size_choice: string;         // e.g. "Medium (shoebox)"
  monthly_orders_choice: string;       // e.g. "500 – 1 000"
  customer_location_choice: string;    // e.g. "Mostly AU, some international"
  current_shipping_method: string;     // e.g. "Home / garage"
  biggest_shipping_problem: string;
  sku_range_choice: string;           // e.g. "101-300"
  delivery_expectation_choice: string;
  shipping_cost_choice: string;       // e.g. "$5-$10"
}

type FulfillmentDecision = "DIY" | "AUS_3PL" | "AUS_MULTI" | "CHINA_3PL";

// Decision logic based on logic.md
function decideFulfillmentOption(answers: QuizFormAnswers): FulfillmentDecision {
  // Extract monthly order count
  const orderMapping: Record<string, number> = {
    "Under 100": 100,
    "100 – 300": 300,
    "300 – 500": 500,
    "500 – 1 000": 1000,
    "1 000 – 2 000": 2000,
    "2 000+": 2500
  };
  const monthlyOrders = orderMapping[answers.monthly_orders_choice] || 100;

  // Extract SKU count
  const skuMapping: Record<string, number> = {
    "1-25": 25,
    "26-100": 100,
    "101-300": 300,
    "300+": 600
  };
  const skuCount = skuMapping[answers.sku_range_choice] || 100;

  // Check if manufacturing/shipping from China
  const isFromChina = answers.current_shipping_method.toLowerCase().includes("china");

  // Check shipping destination focus
  const isGlobalFocus = answers.customer_location_choice.includes("international") && 
                       !answers.customer_location_choice.includes("Mostly AU");

  // Extract weight for China 3PL consideration
  const weightMapping: Record<string, number> = {
    "Under 0.5 kg": 0.25,
    "0.5 kg – 1 kg": 0.75,
    "1 kg – 2 kg": 1.5,
    "2 kg – 5 kg": 3.5,
    "Over 5 kg": 6.0
  };
  const avgWeight = weightMapping[answers.package_weight_choice] || 1.5;

  // Primary decision logic from logic.md
  
  // 1. Under 500 orders = DIY
  if (monthlyOrders < 500) {
    return "DIY";
  }

  // 2. 500-2000 orders
  if (monthlyOrders >= 500 && monthlyOrders <= 2000) {
    // If global focus or from China, consider China 3PL
    if (isGlobalFocus || isFromChina) {
      // But if over 5kg, recommend local fulfillment
      if (avgWeight > 5) {
        return "AUS_3PL";
      }
      return "CHINA_3PL";
    }
    // Otherwise AUS 3PL
    return "AUS_3PL";
  }

  // 3. Over 2000 orders
  if (monthlyOrders > 2000) {
    // If over 500 SKUs, stay in 1 warehouse (too complex to split)
    if (skuCount > 500) {
      if (isGlobalFocus || isFromChina) {
        return "CHINA_3PL";
      } else {
        return "AUS_3PL";
      }
    }
    
    // Multi-state for high volume AUS-focused
    if (!isGlobalFocus && !isFromChina) {
      return "AUS_MULTI";
    } else {
      return "CHINA_3PL";
    }
  }

  return "AUS_3PL"; // Default fallback
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
    "500 – 1 000": 1000,
    "1 000 – 2 000": 2000,
    "2 000+": 2500
  };
  const monthlyOrders = orderMapping[answers.monthly_orders_choice] || 100;

  let savingsPerOrder = 0;

  switch (decision) {
    case "DIY":
      savingsPerOrder = 2; // Up to $2 saved per order with OMS tools
      break;
      
    case "AUS_3PL":
      if (monthlyOrders >= 500 && monthlyOrders <= 2000) {
        savingsPerOrder = 3; // $3 per order for 500-2000 range
      } else {
        savingsPerOrder = 3;
      }
      break;
      
    case "AUS_MULTI":
      savingsPerOrder = 4; // $4 per order for 2000+ multi-state
      break;
      
    case "CHINA_3PL":
      // Weight-based savings from logic.md
      const weight = answers.package_weight_choice;
      if (weight.includes("Under 0.5") || weight.includes("0.5 kg – 1 kg")) {
        savingsPerOrder = 8; // Up to $8 for <1kg
      } else if (weight.includes("1 kg – 2 kg")) {
        savingsPerOrder = 5; // Up to $5 for 1-2kg
      } else {
        savingsPerOrder = 4; // Up to $4 for >2kg
      }
      break;
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
        description: `At your current volume, in-house fulfillment is the smartest move. You're likely doing under 500 orders/month and don't yet need the cost or complexity of a 3PL.
But with a few smart upgrades, you can dramatically reduce time and wasted spend:`,
        benefits: [
          "Use Starshipit, Shippit, or ShipStation to automate label generation and carrier routing",
          "Get a label printer and satchels from your local supplier", 
          "Tighten your packaging to reduce cubic weight and avoid carrier penalties",
          "Start tracking your cost-per-order and fulfillment time"
        ],
        ctaTitle: "🎁 Get Our Free Fulfillment Toolkit",
        ctaText: "Learn how to reduce your workload and improve margins with our curated DIY playbook.",
        ctaUrl: "https://j63rzjzdahixjfu3foqc.app.clientclub.net/communities/groups/ecommerce-insiders-academy/home?invite=67b1bb500ca4a3bf1bba9912",
        note: "(Just by switching to OMS tools and optimizing packaging)"
      };

    case "AUS_3PL":
      return {
        ...baseContent,
        title: "You're Ready to Scale with a Dedicated 3PL in Australia",
        description: `You're moving past 500+ orders/month — which means DIY fulfillment is capping your growth and profits.
Switching to a single Future Fulfillment warehouse will give you:`,
        benefits: [
          "Discounted shipping rates via AusPost & CouriersPlease",
          "Barcode-based inventory, returns management, and live order tracking",
          "Reclaimed time to focus on marketing, growth, and ops",
          "Same costs every month — no more surprises"
        ],
        ctaTitle: "📞 Book Your Free Fulfillment Strategy Call",
        ctaText: "We'll show you how to transition smoothly and start saving within days.",
        ctaUrl: "https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ",
        note: null
      };

    case "AUS_MULTI":
      return {
        ...baseContent,
        title: "You're Ready for Multi-Warehouse Fulfillment in Australia", 
        description: `With 2,000+ orders/month across multiple states, central fulfillment is no longer optimal.
Future Fulfillment's VIC, NSW, and QLD locations give you:`,
        benefits: [
          "Delivery up to 50% faster, with 30% lower cross-state shipping costs",
          "The ability to serve customers same-day or next-day",
          "Inventory redundancy and smoother replenishment cycles",
          "Better customer reviews and lower refund rates"
        ],
        ctaTitle: "📞 Book Your Free Fulfillment Strategy Call",
        ctaText: "We'll map your inventory and show you exactly how much you'll save.",
        ctaUrl: "https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ",
        note: null
      };

    case "CHINA_3PL":
      return {
        ...baseContent,
        title: "China 3PL is Your Best Option for Global Shipping",
        description: `With your global customer base and manufacturing in China, our China 3PL gives you:`,
        benefits: [
          "Specialized shipping lines to over 75 countries",
          "Apparel, battery, sensitive, and cosmetic product lines",
          "Express delivery options (3-6 days average)",
          "Premium quality control and branded packaging",
          "Compliance with dangerous goods transport"
        ],
        ctaTitle: "📞 Book Your Free Fulfillment Strategy Call", 
        ctaText: "We'll show you how to optimize your global shipping strategy.",
        ctaUrl: "https://futurefulfilment.com/ausnz#section-0XX8Pbq9ZQ",
        note: null
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

// Main export function
export function generateResult(form: QuizFormAnswers) {
  const decision = decideFulfillmentOption(form);
  const savings = calculateSavings(decision, form);
  const firstname = form.full_name.split(' ')[0] || "Friend";
  const content = getResultContent(decision, firstname, savings);
  
  return {
    decision,
    content,
    universalSection: UNIVERSAL_BOTTOM_SECTION
  };
} 