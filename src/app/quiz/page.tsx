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
        <h1 className="font-bold text-3xl sm:text-4xl mb-3 tracking-tight transition-colors duration-300 hover:text-[#6BE53D]">
          {typeof step.title === "function" ? step.title(state) : step.title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-light transition-colors duration-300 hover:text-gray-200">{step.subtitle}</p>
      </header>
      <div className="input-container p-4 flex items-center group">
        {step.helperPrefix && (
          <span className="text-gray-400 mr-2 select-none transition-colors duration-300 group-hover:text-[#6BE53D]">{step.helperPrefix}</span>
        )}
        <input
          type={step.stateKey === "email" ? "email" : "text"}
          placeholder={step.placeholder}
          pattern={step.pattern}
          className="w-full bg-transparent border-0 text-white text-xl placeholder-gray-400 focus:outline-none transition-all duration-300 focus:placeholder-gray-300"
          value={state[step.stateKey] as string}
          onChange={(e) => updateState(step.stateKey, step.helperPrefix ? e.target.value.replace(/^https?:\/\//, "") : e.target.value)}
          autoFocus
        />
      </div>
    </div>
  );

  const optionIcon: Record<string, JSX.Element> = {
    "Clothing & Accessories": <Shirt className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Skincare & Cosmetics": <FlaskConical className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Supplements & Health": <Pill className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Tech & Electronics": <Cpu className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Home & Living": <Home className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Baby & Kids": <Baby className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Books & Media": <BookOpen className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Sports & Fitness": <Dumbbell className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    Other: <CircleEllipsis className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    // additional icons for single-choice screens
    Small: <Package className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />, // generic
    Medium: <Package className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    Large: <Package className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Very large (oversized)": <Package className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Australia only": <Globe className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Mostly AU, some international": <Globe className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Half AU, half international": <Globe className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Mostly international": <Globe className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "International only": <Globe className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Home / garage": <Home className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Office / warehouse": <Warehouse className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "3PL in Australia": <Warehouse className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "3PL in China": <Warehouse className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    Dropshipping: <Truck className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "<$5": <DollarSign className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />, // etc.
  };

  const renderChoiceStep = (step: ChoiceStep) => {
    const currentVal = state[step.stateKey];
    return (
      <div className="flex flex-col gap-8 flex-1">
        <header>
          <h1 className="font-bold text-3xl sm:text-4xl mb-3 tracking-tight transition-colors duration-300 hover:text-[#6BE53D]">{step.title}</h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light transition-colors duration-300 hover:text-gray-200">{step.subtitle}</p>
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
                className={`option-card glass-morphism p-4 rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#6BE53D]/20 ${selected ? "selected ring-2 ring-[#6BE53D]/50" : "hover:bg-white/10"}`}
              >
                <div className="icon-container w-10 h-10 rounded-full mb-2 flex items-center justify-center group">
                  {optionIcon[opt] ?? <CheckCircleIcon className="w-5 h-5 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />}
                </div>
                <span className="text-sm font-medium whitespace-pre-wrap transition-colors duration-300 group-hover:text-white">{opt}</span>
              </div>
            );
          })}
        </div>
        {step.allowOther && (currentVal as string[]).includes("Other") && (
          <div className="input-container p-3 flex items-center mt-4 group">
            <input
              type="text"
              placeholder="Please specify…"
              className="w-full bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 focus:placeholder-gray-300"
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
      <div className="relative min-h-screen bg-black overflow-hidden pt-safe-top">
        {/* Static Green Gradient at Top */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#6BE53D]/35 via-[#6BE53D]/18 to-transparent pointer-events-none z-5"></div>
        
        {/* Gradually Visible Grid Background */}
        <div 
          className="absolute bottom-0 left-0 w-full h-2/3 pointer-events-none z-15"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.3) 2px, transparent 2px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.3) 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)'
          }}
        />
        
        {/* Hover Effect Grid Overlay */}
        <div 
          className="absolute bottom-0 left-0 w-full h-2/3 z-16 opacity-0 hover:opacity-30 transition-opacity duration-500"
          style={{
            backgroundImage: `
              radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(107, 229, 61, 0.3) 0%, transparent 50%)
            `,
            backgroundSize: '200px 200px'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
          }}
        />
        
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl relative z-10 mt-8 sm:mt-0">
            <div className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-6 sm:p-10 text-center animate-step min-h-[32rem] flex flex-col items-center justify-center">
              
              {/* Processing Animation */}
              <div className="mb-8 flex flex-col items-center">
                {/* Clean Processing Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#6BE53D] to-teal-600 flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Processing Text */}
                <h1 className="font-bold text-2xl sm:text-3xl mb-4 tracking-tight">
                  Analyzing Your Business...
                </h1>
                <p className="text-base sm:text-lg font-medium mb-8" style={{ color: '#6BE53D' }}>
                  Our AI is comparing 50+ fulfillment providers
                </p>
                
                {/* Processing Steps */}
                <div className="space-y-4 w-full max-w-md">
                  <div className="flex items-center gap-3 animate-fadeIn">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6BE53D' }}></div>
                    <span className="font-medium" style={{ color: '#6BE53D' }}>Analyzing your shipping requirements</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#6BE53D]/50 to-transparent"></div>
                  </div>
                  <div className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '1s' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6BE53D', animationDelay: '1s' }}></div>
                    <span className="font-medium" style={{ color: '#6BE53D' }}>Comparing costs across providers</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#6BE53D]/50 to-transparent" style={{ animationDelay: '1s' }}></div>
                  </div>
                  <div className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '2s' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6BE53D', animationDelay: '2s' }}></div>
                    <span className="font-medium" style={{ color: '#6BE53D' }}>Calculating optimal delivery zones</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#6BE53D]/50 to-transparent" style={{ animationDelay: '2s' }}></div>
                  </div>
                  <div className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '3s' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6BE53D', animationDelay: '3s' }}></div>
                    <span className="font-medium" style={{ color: '#6BE53D' }}>Matching with similar businesses</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#6BE53D]/50 to-transparent" style={{ animationDelay: '3s' }}></div>
                  </div>
                  <div className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '4s' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#6BE53D', animationDelay: '4s' }}></div>
                    <span className="font-medium" style={{ color: '#6BE53D' }}>Generating personalized recommendations</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#6BE53D]/50 to-transparent" style={{ animationDelay: '4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success celebration state
  if (showConfetti) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden pt-safe-top">
        {/* Static Green Gradient at Top */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#6BE53D]/35 via-[#6BE53D]/18 to-transparent pointer-events-none z-5"></div>
        
        {/* Gradually Visible Grid Background */}
        <div 
          className="absolute bottom-0 left-0 w-full h-2/3 pointer-events-none z-15"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 116, 139, 0.3) 2px, transparent 2px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.3) 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)'
          }}
        />
        
        {/* Hover Effect Grid Overlay */}
        <div 
          className="absolute bottom-0 left-0 w-full h-2/3 z-16 opacity-0 hover:opacity-30 transition-opacity duration-500"
          style={{
            backgroundImage: `
              radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(107, 229, 61, 0.3) 0%, transparent 50%)
            `,
            backgroundSize: '200px 200px'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
          }}
        />
        
        {/* Beautiful particle effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
          {/* Floating light particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div 
                className="w-1 h-1 rounded-full opacity-60 animate-pulse"
                style={{
                  backgroundColor: Math.random() > 0.5 ? '#6BE53D' : '#2dd4bf',
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: `0 0 10px ${Math.random() > 0.5 ? '#6BE53D' : '#2dd4bf'}`
                }}
              />
            </div>
          ))}
          
          {/* Elegant rising sparkles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute animate-float"
              style={{
                left: `${20 + Math.random() * 60}%`,
                bottom: `${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            >
              <svg 
                className="w-3 h-3 text-[#6BE53D] animate-pulse opacity-70"
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{ animationDelay: `${Math.random() * 1}s` }}
              >
                <path d="M12 0l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-3.01L12 0z"/>
              </svg>
            </div>
          ))}
          
          {/* Radial success glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-[#6BE53D]/10 via-[#6BE53D]/5 to-transparent rounded-full animate-pulse"></div>
        </div>
        
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl relative z-10 mt-8 sm:mt-0">
            <div className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-6 sm:p-10 text-center animate-step min-h-[32rem] flex flex-col items-center justify-center">
              
              {/* Success Animation */}
              <div className="mb-8 flex flex-col items-center">
                {/* Success Icon with elegant animation */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#6BE53D] to-teal-600 flex items-center justify-center animate-pulseGlow">
                    <CheckCircleIcon className="w-12 h-12 text-white animate-bounce" style={{ animationDuration: '1s' }} />
                  </div>
                  
                  {/* Success ripples */}
                  <div className="absolute inset-0 w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-2 border-[#6BE53D]/40 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border border-[#6BE53D]/30 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute inset-0 rounded-full border border-teal-400/30 animate-ping" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                  
                  {/* Elegant rotating success rays */}
                  <div className="absolute inset-0 w-32 h-32 -top-4 -left-4 animate-spin" style={{ animationDuration: '8s' }}>
                    <div className="w-1 h-6 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 opacity-40" style={{ backgroundColor: '#6BE53D' }}></div>
                    <div className="w-1 h-6 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-40" style={{ backgroundColor: '#6BE53D' }}></div>
                    <div className="w-6 h-1 rounded-full absolute left-0 top-1/2 transform -translate-y-1/2 opacity-40" style={{ backgroundColor: '#6BE53D' }}></div>
                    <div className="w-6 h-1 rounded-full absolute right-0 top-1/2 transform -translate-y-1/2 opacity-40" style={{ backgroundColor: '#6BE53D' }}></div>
                    <div className="w-1 h-4 rounded-full absolute top-2 right-2 transform rotate-45 opacity-30" style={{ backgroundColor: '#6BE53D' }}></div>
                    <div className="w-1 h-4 rounded-full absolute bottom-2 left-2 transform rotate-45 opacity-30" style={{ backgroundColor: '#6BE53D' }}></div>
                    <div className="w-1 h-4 rounded-full absolute top-2 left-2 transform -rotate-45 opacity-30" style={{ backgroundColor: '#6BE53D' }}></div>
                    <div className="w-1 h-4 rounded-full absolute bottom-2 right-2 transform -rotate-45 opacity-30" style={{ backgroundColor: '#6BE53D' }}></div>
                  </div>
                </div>
                
                {/* Success Text */}
                <h1 className="font-bold text-3xl sm:text-4xl mb-4 tracking-tight">
                  Analysis Complete! ✨
                </h1>
                <p className="text-lg sm:text-xl font-medium mb-6" style={{ color: '#6BE53D' }}>
                  We've found your perfect fulfillment strategy
                </p>
                
                {/* Success stats */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="glass-morphism p-3 rounded-xl animate-fadeIn transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg hover:shadow-[#6BE53D]/20 cursor-pointer group">
                    <div className="font-bold text-lg transition-all duration-300 group-hover:scale-110" style={{ color: '#6BE53D' }}>1,000+</div>
                    <div className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">Brands Analyzed</div>
                  </div>
                  <div className="glass-morphism p-3 rounded-xl animate-fadeIn transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg hover:shadow-[#6BE53D]/20 cursor-pointer group" style={{ animationDelay: '0.2s' }}>
                    <div className="font-bold text-lg transition-all duration-300 group-hover:scale-110" style={{ color: '#6BE53D' }}>14</div>
                    <div className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">Data Points</div>
                  </div>
                  <div className="glass-morphism p-3 rounded-xl animate-fadeIn transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-lg hover:shadow-[#6BE53D]/20 cursor-pointer group" style={{ animationDelay: '0.4s' }}>
                    <div className="font-bold text-lg transition-all duration-300 group-hover:scale-110" style={{ color: '#6BE53D' }}>AI</div>
                    <div className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">Powered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen bg-black overflow-hidden pt-safe-top">
      {/* Static Green Gradient at Top */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#6BE53D]/35 via-[#6BE53D]/18 to-transparent pointer-events-none z-5"></div>
      
      {/* Gradually Visible Grid Background */}
      <div 
        className="absolute bottom-0 left-0 w-full h-2/3 pointer-events-none z-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 116, 139, 0.3) 2px, transparent 2px),
            linear-gradient(90deg, rgba(100, 116, 139, 0.3) 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)'
        }}
      />
      
      {/* Hover Effect Grid Overlay */}
      <div 
        className="absolute bottom-0 left-0 w-full h-2/3 z-16 opacity-0 hover:opacity-30 transition-opacity duration-500"
        style={{
          backgroundImage: `
            radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(107, 229, 61, 0.3) 0%, transparent 50%)
          `,
          backgroundSize: '200px 200px'
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
          e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl relative z-10">
          {!completion ? (
            <div
              key={page}
              className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 animate-step min-h-[28rem] sm:min-h-[32rem] flex flex-col transition-all duration-500 hover:shadow-3xl hover:shadow-[#6BE53D]/10"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isStepValid) {
                  setPage((p) => p + 1);
                }
              }}
            >
              {currentStep.kind === "text" ? renderTextStep(currentStep) : renderChoiceStep(currentStep)}

              {/* nav */}
              <div className="flex justify-between mt-auto pt-6 sm:pt-8">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-300 hover:text-[#6BE53D] font-medium flex items-center text-xs sm:text-sm disabled:opacity-20 transition-all duration-300 hover:scale-105 hover:bg-white/5 rounded-lg disabled:hover:scale-100 disabled:hover:bg-transparent group"
                >
                  <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 transition-transform duration-300 group-hover:-translate-x-1" /> Back
                </button>
                <button
                  disabled={!isStepValid}
                  onClick={() => setPage((p) => p + 1)}
                  className="liquid-button px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-white font-medium rounded-full flex items-center justify-center disabled:opacity-50 text-xs sm:text-sm group"
                >
                  Continue <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ) : (
            <div key="done" className="glass-morphism container-shimmer rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 text-center animate-step min-h-[28rem] sm:min-h-[32rem] flex flex-col transition-all duration-500 hover:shadow-3xl hover:shadow-[#6BE53D]/10">
              <div className="mb-6 sm:mb-8 flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#6BE53D] to-teal-600 rounded-full mb-4 sm:mb-6 flex items-center justify-center animate-pulseGlow">
                  <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 tracking-tight">All set!</h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light">We're ready to optimize your shipping experience</p>
              </div>
              <div className="flex justify-center mt-auto">
                <button 
                  onClick={handleComplete}
                  className="liquid-button px-6 sm:px-8 md:px-10 py-2 sm:py-2.5 md:py-3 text-white font-medium rounded-full flex items-center justify-center text-xs sm:text-sm group"
                >
                  Get My Results <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 