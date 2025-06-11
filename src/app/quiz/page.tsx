"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  Shirt,
  FlaskConical,
  Pill,
  Cpu,
  Home,
  Baby,
  BookOpen,
  Dumbbell,
  CircleEllipsis,
  Package,
  Globe,
  Warehouse,
  Truck,
  DollarSign,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

/* ---------- type helpers ---------- */
interface QuizState {
  name: string;
  website: string;
  products: string[];
  productsOther?: string;
  weight?: string;
  size?: string;
  orders?: string;
  customerLoc?: string;
  shipMethod?: string;
  shipProblem?: string;
  productRange?: string;
  deliveryExpect?: string;
  shipCost?: string;
  email: string;
  phone: string;
}

type TextStep = {
  kind: "text";
  title: string | ((s: QuizState) => string);
  subtitle: string;
  stateKey: keyof QuizState;
  placeholder?: string;
  helperPrefix?: string;
  pattern?: string;
};

type ChoiceStep = {
  kind: "choice";
  title: string;
  subtitle: string;
  options: string[];
  stateKey: keyof QuizState;
  multi?: boolean;
  allowOther?: boolean;
};

type Step = TextStep | ChoiceStep;

/* ---------- static data ---------- */
const steps: Step[] = [
  {
    kind: "text",
    title: "Let's get started",
    subtitle: "What's your name?",
    stateKey: "name",
    placeholder: "Your name",
  },
  {
    kind: "text",
    title: (s) => `Hey ${s.name || "there"} 👋`,
    subtitle: "What's your website URL?",
    stateKey: "website",
    placeholder: "yourwebsite.com",
    helperPrefix: "https://",
    pattern: "^(([a-zA-Z0-9-]+)\\.)+[a-zA-Z]{2,}$",
  },
  {
    kind: "choice",
    title: "Your products",
    subtitle: "What products do you sell?",
    options: [
      "Clothing & Accessories",
      "Skincare & Cosmetics",
      "Supplements & Health",
      "Tech & Electronics",
      "Home & Living",
      "Baby & Kids",
      "Books & Media",
      "Sports & Fitness",
      "Other",
    ],
    stateKey: "products",
    multi: true,
    allowOther: true,
  },
  {
    kind: "choice",
    title: "Product weight",
    subtitle: "How much do your packages usually weigh?",
    options: [
      "Under 0.5 kg",
      "0.5 kg – 1 kg",
      "1 kg – 2 kg",
      "2 kg – 5 kg",
      "Over 5 kg",
    ],
    stateKey: "weight",
  },
  {
    kind: "choice",
    title: "Package size",
    subtitle: "What size are your typical packages?",
    options: [
      "Small (<3 cm thick)",
      "Medium (shoebox)",
      "Large (briefcase)",
      "Very large (oversized)",
    ],
    stateKey: "size",
  },
  {
    kind: "choice",
    title: "Order volume",
    subtitle: "How many orders do you ship per month?",
    options: [
      "Under 100",
      "100 – 300",
      "300 – 500",
      "500 – 1 000",
      "1 000 – 2 000",
      "2 000+",
    ],
    stateKey: "orders",
  },
  {
    kind: "choice",
    title: "Customer location",
    subtitle: "Where do most of your customers live?",
    options: [
      "Australia only",
      "Mostly AU, some international",
      "Half AU, half international",
      "Mostly international",
      "International only",
    ],
    stateKey: "customerLoc",
  },
  {
    kind: "choice",
    title: "Current shipping setup",
    subtitle: "How do you currently ship?",
    options: [
      "Home / garage",
      "Office / warehouse",
      "3PL in Australia",
      "3PL in China",
      "Dropshipping",
    ],
    stateKey: "shipMethod",
  },
  {
    kind: "choice",
    title: "Biggest pain-point",
    subtitle: "What's your biggest shipping problem?",
    options: [
      "Costs too high",
      "Takes too much time",
      "Delivery too slow",
      "International complexity",
      "Customer complaints",
      "Hard returns",
    ],
    stateKey: "shipProblem",
  },
  {
    kind: "choice",
    title: "Catalogue size",
    subtitle: "How many different products do you sell?",
    options: ["1-25", "26-100", "101-300", "300+"],
    stateKey: "productRange",
  },
  {
    kind: "choice",
    title: "Delivery expectation",
    subtitle: "How fast do customers expect delivery?",
    options: ["Same / next day", "2-3 days", "3-5 days"],
    stateKey: "deliveryExpect",
  },
  {
    kind: "choice",
    title: "Shipping cost",
    subtitle: "How much are you paying to ship per order?",
    options: ["<$5", "$5-$10", "$10-$15", "$15-$20", ">$20"],
    stateKey: "shipCost",
  },
  {
    kind: "text",
    title: "Almost done!",
    subtitle: "What's a good email for you?",
    stateKey: "email",
    placeholder: "you@example.com",
    pattern: "^.+@.+\\..+$",
  },
  {
    kind: "text",
    title: "And your phone number?",
    subtitle: "We'll only call if absolutely necessary",
    stateKey: "phone",
    placeholder: "+61…",
    pattern: "^\\+?[0-9]{6,15}$",
  },
];

/* ---------- component ---------- */
export default function QuizPage() {
  const router = useRouter();
  const [page, setPage] = useState(0); // zero-based index into steps
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [state, setState] = useState<QuizState>({
    name: "",
    website: "",
    products: [],
    email: "",
    phone: "",
  });
  const currentStep = steps[page];
  const totalPages = steps.length;
  const progressPercent = (page / totalPages) * 100;

  /* ----- helpers ----- */
  const updateState = (key: keyof QuizState, value: any) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const handleComplete = () => {
    setIsProcessing(true);
    
    // Convert quiz state to format expected by fulfillment advisor
    const formAnswers = {
      full_name: state.name,
      email: state.email,
      phone: state.phone,
      website_url: state.website,
      products: Array.isArray(state.products) ? state.products.join(', ') : state.products,
      package_weight_choice: state.weight || "",
      package_size_choice: state.size || "",
      monthly_orders_choice: state.orders || "",
      customer_location_choice: state.customerLoc || "",
      current_shipping_method: state.shipMethod || "",
      biggest_shipping_problem: state.shipProblem || "",
      sku_range_choice: state.productRange || "",
      delivery_expectation_choice: state.deliveryExpect || "",
      shipping_cost_choice: state.shipCost || ""
    };
    
    // Save converted data to localStorage
    localStorage.setItem('quizAnswers', JSON.stringify(formAnswers));
    
    // Show processing animation for 4.5 seconds (slower), then confetti, then navigate
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfetti(true);
      
      // Show confetti for 3 seconds then navigate
      setTimeout(() => {
        router.push('/result');
      }, 3000);
    }, 4500);
  };

  const isStepValid = useMemo(() => {
    if (!currentStep) return true;
    const val = state[currentStep.stateKey];
    if (currentStep.kind === "text") {
      if (!val || (typeof val === "string" && !val.trim())) return false;
      if (currentStep.pattern) {
        const re = new RegExp(currentStep.pattern);
        return re.test(val as string);
      }
      return true;
    } else {
      // choice
      if (currentStep.multi) return (val as string[]).length > 0;
      return !!val;
    }
  }, [currentStep, state]);

  /* ----- render helpers ----- */
  const renderTextStep = (step: TextStep) => (
    <div className="flex flex-col gap-10 flex-1">
      <header>
        <h1 className="font-bold text-3xl sm:text-4xl mb-3 tracking-tight">
          {typeof step.title === "function" ? step.title(state) : step.title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-light">{step.subtitle}</p>
      </header>
      <div className="input-container p-4 flex items-center">
        {step.helperPrefix && (
          <span className="text-gray-400 mr-2 select-none">{step.helperPrefix}</span>
        )}
        <input
          type={step.stateKey === "email" ? "email" : "text"}
          placeholder={step.placeholder}
          pattern={step.pattern}
          className="w-full bg-transparent border-0 text-white text-xl placeholder-gray-400 focus:outline-none"
          value={state[step.stateKey] as string}
          onChange={(e) => updateState(step.stateKey, step.helperPrefix ? e.target.value.replace(/^https?:\/\//, "") : e.target.value)}
          autoFocus
        />
      </div>
    </div>
  );

  const optionIcon: Record<string, JSX.Element> = {
    "Clothing & Accessories": <Shirt className="w-5 h-5 rounded-sm" />,
    "Skincare & Cosmetics": <FlaskConical className="w-5 h-5 rounded-sm" />,
    "Supplements & Health": <Pill className="w-5 h-5 rounded-sm" />,
    "Tech & Electronics": <Cpu className="w-5 h-5 rounded-sm" />,
    "Home & Living": <Home className="w-5 h-5 rounded-sm" />,
    "Baby & Kids": <Baby className="w-5 h-5 rounded-sm" />,
    "Books & Media": <BookOpen className="w-5 h-5 rounded-sm" />,
    "Sports & Fitness": <Dumbbell className="w-5 h-5 rounded-sm" />,
    Other: <CircleEllipsis className="w-5 h-5 rounded-sm" />,
    // additional icons for single-choice screens
    Small: <Package className="w-5 h-5 rounded-sm" />, // generic
    Medium: <Package className="w-5 h-5 rounded-sm" />,
    Large: <Package className="w-5 h-5 rounded-sm" />,
    "Very large (oversized)": <Package className="w-5 h-5 rounded-sm" />,
    "Australia only": <Globe className="w-5 h-5 rounded-sm" />,
    "Mostly AU, some international": <Globe className="w-5 h-5 rounded-sm" />,
    "Half AU, half international": <Globe className="w-5 h-5 rounded-sm" />,
    "Mostly international": <Globe className="w-5 h-5 rounded-sm" />,
    "International only": <Globe className="w-5 h-5 rounded-sm" />,
    "Home / garage": <Home className="w-5 h-5 rounded-sm" />,
    "Office / warehouse": <Warehouse className="w-5 h-5 rounded-sm" />,
    "3PL in Australia": <Warehouse className="w-5 h-5 rounded-sm" />,
    "3PL in China": <Warehouse className="w-5 h-5 rounded-sm" />,
    Dropshipping: <Truck className="w-5 h-5 rounded-sm" />,
    "<$5": <DollarSign className="w-5 h-5 rounded-sm" />, // etc.
  };

  const renderChoiceStep = (step: ChoiceStep) => {
    const currentVal = state[step.stateKey];
    return (
      <div className="flex flex-col gap-8 flex-1">
        <header>
          <h1 className="font-bold text-3xl sm:text-4xl mb-3 tracking-tight">{step.title}</h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light">{step.subtitle}</p>
        </header>
        <div className={`grid gap-4 ${step.multi ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          {step.options.map((opt) => {
            const selected = step.multi
              ? (currentVal as string[]).includes(opt)
              : currentVal === opt;
            return (
              <div
                key={opt}
                onClick={() => {
                  if (step.multi) {
                    const list = currentVal as string[];
                    updateState(
                      step.stateKey,
                      list.includes(opt) ? list.filter((o) => o !== opt) : [...list, opt]
                    );
                  } else {
                    updateState(step.stateKey, opt);
                    // auto next after brief delay
                    setTimeout(() => {
                      setPage((p) => p + 1);
                    }, 250);
                  }
                }}
                className={`option-card glass-morphism p-4 rounded-2xl cursor-pointer ${selected ? "selected" : ""}`}
              >
                <div className="icon-container w-10 h-10 rounded-full mb-2 flex items-center justify-center">
                  {optionIcon[opt] ?? <CheckCircleIcon className="w-5 h-5 text-emerald-400" />}
                </div>
                <span className="text-sm font-medium whitespace-pre-wrap">{opt}</span>
              </div>
            );
          })}
        </div>
        {step.allowOther && (currentVal as string[]).includes("Other") && (
          <div className="input-container p-3 flex items-center mt-4">
            <input
              type="text"
              placeholder="Please specify…"
              className="w-full bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none"
              value={state.productsOther ?? ""}
              onChange={(e) => updateState("productsOther", e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  /* ----- main render ----- */
  const completion = page >= totalPages;
  
  // Processing state
  if (isProcessing) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-motion bg-bottom-glow bg-top-stars">
        {/* Floating background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl animate-float"></div>
        </div>
        
        <div className="w-full max-w-2xl relative z-10">
          <div className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-6 sm:p-10 text-center animate-step min-h-[32rem] flex flex-col items-center justify-center">
            
            {/* Processing Animation */}
            <div className="mb-8 flex flex-col items-center">
              {/* Animated Processing Icon */}
              <div className="relative mb-6">
                {/* Main spinning ring */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center animate-pulseGlow">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
                    {/* Brain/AI icon in center */}
                    <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>
                </div>
                
                {/* Floating analysis particles */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full absolute bottom-2 left-1/2 transform -translate-x-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full absolute left-2 top-1/2 transform -translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full absolute right-2 top-1/2 transform -translate-y-1/2 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                {/* Outer orbital ring */}
                <div className="absolute inset-0 w-32 h-32 -top-4 -left-4 animate-spin" style={{ animationDuration: '12s' }}>
                  <div className="w-2 h-2 bg-emerald-300/60 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  <div className="w-2 h-2 bg-teal-300/60 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
              
              {/* Processing Text */}
              <h1 className="font-bold text-3xl sm:text-4xl mb-4 tracking-tight">Processing Your Results</h1>
              <p className="text-lg sm:text-xl text-gray-300 font-light mb-6">
                Our AI is analyzing your business profile and comparing it against 1,000+ successful brands...
              </p>
              
              {/* Processing Steps Animation */}
              <div className="space-y-5 text-sm text-gray-400 max-w-lg">
                <div className="flex items-center gap-3 transition-all duration-500">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">Analyzing order volume and growth patterns</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/40 to-transparent"></div>
                </div>
                <div className="flex items-center gap-3 transition-all duration-500" style={{ animationDelay: '1s' }}>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-gray-300">Evaluating shipping destinations and customer locations</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/40 to-transparent" style={{ animationDelay: '1s' }}></div>
                </div>
                <div className="flex items-center gap-3 transition-all duration-500" style={{ animationDelay: '2s' }}>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <span className="text-gray-300">Comparing against 1,000+ successful Australian brands</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/40 to-transparent" style={{ animationDelay: '2s' }}></div>
                </div>
                <div className="flex items-center gap-3 transition-all duration-500" style={{ animationDelay: '3s' }}>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
                  <span className="text-gray-300">Calculating optimal fulfillment strategy and savings</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/40 to-transparent" style={{ animationDelay: '3s' }}></div>
                </div>
                <div className="flex items-center gap-3 transition-all duration-500" style={{ animationDelay: '4s' }}>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
                  <span className="text-emerald-300 font-medium">Generating personalized recommendations</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-teal-400/50 to-transparent" style={{ animationDelay: '4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confetti celebration state
  if (showConfetti) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-motion bg-bottom-glow bg-top-stars">
        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Main confetti */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div 
                className={`w-3 h-3 ${
                  Math.random() > 0.5 ? 'bg-emerald-400' : 'bg-teal-400'
                } ${
                  Math.random() > 0.7 ? 'rounded-full' : 'rounded-sm'
                } animate-confetti-spin shadow-lg`}
                style={{
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 1}s`
                }}
              />
            </div>
          ))}
          
          {/* Larger confetti pieces */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2.5 + Math.random() * 1.5}s`
              }}
            >
              <div 
                className={`w-2 h-6 ${
                  Math.random() > 0.5 ? 'bg-emerald-300' : 'bg-teal-300'
                } rounded-sm animate-confetti-spin shadow-lg opacity-80`}
                style={{
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${0.8 + Math.random() * 0.5}s`
                }}
              />
            </div>
          ))}
          
          {/* Background glow effect */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-emerald-400/20 to-transparent blur-3xl animate-pulse"></div>
        </div>
        
        <div className="w-full max-w-2xl relative z-10">
          <div className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-6 sm:p-10 text-center animate-step min-h-[32rem] flex flex-col items-center justify-center">
            
            {/* Success Animation */}
            <div className="mb-8 flex flex-col items-center">
              {/* Success Icon */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center animate-pulseGlow">
                  <CheckCircleIcon className="w-12 h-12 text-white" />
                </div>
                
                {/* Success rays */}
                <div className="absolute inset-0 animate-spin">
                  <div className="w-1 h-8 bg-emerald-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 opacity-60"></div>
                  <div className="w-1 h-8 bg-teal-400 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 opacity-60"></div>
                  <div className="w-8 h-1 bg-emerald-400 rounded-full absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 opacity-60"></div>
                  <div className="w-8 h-1 bg-teal-400 rounded-full absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 opacity-60"></div>
                </div>
              </div>
              
              {/* Success Text */}
              <h1 className="font-bold text-3xl sm:text-4xl mb-4 tracking-tight animate-bounce">
                Analysis Complete! 🎉
              </h1>
              <p className="text-lg sm:text-xl text-emerald-300 font-medium mb-6">
                We've found your perfect fulfillment strategy
              </p>
              
              {/* Success stats */}
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="glass-morphism p-3 rounded-xl">
                  <div className="text-emerald-400 font-bold text-lg">1,000+</div>
                  <div className="text-gray-400">Brands Analyzed</div>
                </div>
                <div className="glass-morphism p-3 rounded-xl">
                  <div className="text-emerald-400 font-bold text-lg">14</div>
                  <div className="text-gray-400">Data Points</div>
                </div>
                <div className="glass-morphism p-3 rounded-xl">
                  <div className="text-emerald-400 font-bold text-lg">AI</div>
                  <div className="text-gray-400">Powered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-motion bg-bottom-glow bg-top-stars">
      {/* progress */}
      {page > 0 && !completion && (
        <div className="glass-track w-full max-w-2xl h-[6px] rounded-full overflow-hidden mb-3 mx-auto sm:mb-0 sm:fixed sm:top-10 sm:left-1/2 sm:-translate-x-1/2">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="text-center text-sm text-gray-300 font-light">
              {page + 1} / {totalPages}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10">
        {!completion ? (
          <div
            key={page}
            className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-6 sm:p-10 animate-step min-h-[32rem] flex flex-col"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isStepValid) {
                setPage((p) => p + 1);
              }
            }}
          >
            {currentStep.kind === "text" ? renderTextStep(currentStep) : renderChoiceStep(currentStep)}

            {/* nav */}
            <div className="flex justify-between mt-auto pt-8">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-2 text-gray-300 hover:text-emerald-400 font-medium flex items-center text-sm disabled:opacity-20"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back
              </button>
              <button
                disabled={!isStepValid}
                onClick={() => setPage((p) => p + 1)}
                className="liquid-button px-8 py-3 text-white font-medium rounded-full flex items-center justify-center disabled:opacity-50 text-sm"
              >
                Continue <ChevronRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        ) : (
          <div key="done" className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-6 sm:p-10 text-center animate-step min-h-[32rem] flex flex-col">
            <div className="mb-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 flex items-center justify-center animate-pulseGlow">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-bold text-4xl mb-3 tracking-tight">All set!</h1>
              <p className="text-xl text-gray-300 font-light">We're ready to optimize your shipping experience</p>
            </div>
            <div className="flex justify-center mt-auto">
              <button 
                onClick={handleComplete}
                className="liquid-button px-10 py-3 text-white font-medium rounded-full flex items-center justify-center"
              >
                Get My Results <ChevronRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 