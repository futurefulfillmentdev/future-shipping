"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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

// Phone number library imports
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ---------- type helpers ---------- */
interface QuizState {
  name: string;
  website: string;
  products: string[] | string;
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
    subtitle: "What's your full name?",
    stateKey: "name",
    placeholder: "Enter your full name",
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
    placeholder: "Enter your phone number",
  },
];

/* ---------- component ---------- */
export default function QuizPage() {
  const router = useRouter();
  const [page, setPage] = useState(0); // zero-based index into steps
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [checklistStep, setChecklistStep] = useState(0);
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
    setChecklistStep(0);
    
    // Extract primary product category for return risk analysis
    const primaryCategory = Array.isArray(state.products) && state.products.length > 0 
      ? state.products[0] 
      : typeof state.products === 'string' && state.products
        ? (state.products as string).split(',')[0]?.trim() 
        : '';
    
    // Convert quiz state to format expected by fulfillment advisor
    const formAnswers = {
      full_name: state.name,
      email: state.email,
      phone: state.phone,
      website_url: state.website,
      products: Array.isArray(state.products) ? state.products.join(', ') : state.products,
      package_weight_choice: state.weight || "",
      package_size_choice: state.size || "",
      volume_range: state.orders || "",
      customer_location_choice: state.customerLoc || "",
      current_shipping_method: state.shipMethod || "",
      biggest_shipping_problem: state.shipProblem || "",
      sku_range_choice: state.productRange || "",
      delivery_expectation_choice: state.deliveryExpect || "",
      shipping_cost_choice: state.shipCost || "",
      category: primaryCategory // Add category for return risk analysis
    };
    
    // Save converted data to localStorage
    localStorage.setItem('quizAnswers', JSON.stringify(formAnswers));

    // Fire-and-forget push to server-side API to sync with GoHighLevel
    fetch('/api/highlevel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formAnswers)
    }).then(async response => {
      const result = await response.json();
      if (response.ok && result.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`HighLevel sync successful: Contact ${result.action}`, result.contactId);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('HighLevel sync had issues:', result.error);
        }
      }
    }).catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('HighLevel sync failed', err);
      }
    });
    
    // Premium, deliberate animation sequence
    const checklistItems = [
      "Analyzing your business data...",
      "Comparing shipping carriers...", 
      "Calculating cost savings...",
      "Generating your strategy...",
      "Finalizing recommendations..."
    ];
    
    checklistItems.forEach((_, index) => {
      setTimeout(() => {
        setChecklistStep(index + 1);
      }, (index + 1) * 1000); // Slower 1000ms per step for more premium feel
    });
    
    // After all steps, show success briefly then navigate
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfetti(true);
      
      // Navigate automatically after success animation
      setTimeout(() => {
        router.push('/result');
      }, 2000); // Longer success duration for more premium feel
    }, checklistItems.length * 1000 + 600); // Slower transition
  };

  const isStepValid = useMemo(() => {
    if (!currentStep) return true;
    const val = state[currentStep.stateKey];
    if (currentStep.kind === "text") {
      if (!val || (typeof val === "string" && !val.trim())) return false;
      
      // Phone number validation for the new library
      if (currentStep.stateKey === "phone") {
        // The library handles E.164 format validation internally
        return !!val && val.length > 5; // Basic validation
      }
      
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
  const renderTextStep = (step: TextStep) => {
    // Special handling for phone number input
    if (step.stateKey === "phone") {
      return (
        <div className="flex flex-col gap-10 flex-1">
          <header>
            <h1 className="font-bold text-3xl sm:text-4xl mb-3 tracking-tight transition-colors duration-300 hover:text-[#6BE53D]">
              {typeof step.title === "function" ? step.title(state) : step.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 font-light transition-colors duration-300 hover:text-gray-200">{step.subtitle}</p>
          </header>
          
          <div className="space-y-4">
            <div className="phone-input-container">
              <PhoneInput
                international
                defaultCountry="US"
                value={state.phone}
                onChange={(value) => updateState('phone', value || '')}
                className="phone-input-custom"
                placeholder="Enter phone number"
                autoFocus
              />
            </div>
          </div>
        </div>
      );
    }

    // Default rendering for other text inputs
    return (
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
  };

  const optionIcon: Record<string, React.ReactElement> = {
    "Clothing & Accessories": <Shirt className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Skincare & Cosmetics": <FlaskConical className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Supplements & Health": <Pill className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Tech & Electronics": <Cpu className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Home & Living": <Home className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Baby & Kids": <Baby className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Books & Media": <BookOpen className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Sports & Fitness": <Dumbbell className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    Other: <CircleEllipsis className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    // Package size icons - consistent Package icons for all sizes
    "Small (<3 cm thick)": <Package className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Medium (shoebox)": <Package className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "Large (briefcase)": <Package className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
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
    "<$5": <DollarSign className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "$5-$10": <DollarSign className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "$10-$15": <DollarSign className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "$15-$20": <DollarSign className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    "> $20": <DollarSign className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
    ">$20": <DollarSign className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110" />,
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
    return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Green gradient background matching home page */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#6BE53D]/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
      

      

      
      {/* Premium Analysis Loading Component */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className="fixed inset-0 bg-black flex items-center justify-center z-40 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Green gradient background matching home page */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#6BE53D]/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
            
            <motion.div 
              className="w-full max-w-2xl md:max-w-3xl relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl">
                
                {/* Header Section */}
                <motion.div 
                  className="text-center mb-8 sm:mb-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {/* Future Logo */}
                  <motion.div
                    className="mb-6"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <Image 
                      src="/future-logo-white.svg" 
                      alt="Future Fulfillment" 
                      width={160} 
                      height={36}
                      className="h-8 sm:h-10 w-auto mx-auto" 
                      priority
                    />
                  </motion.div>
                  
                  <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 tracking-tight text-white">
                    Analyzing Your Business
                </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light max-w-xl mx-auto leading-relaxed">
                    Our AI is crafting the perfect shipping strategy for your unique&nbsp;business
                  </p>
                </motion.div>

                {/* Elegant Progress Bar */}
                <motion.div 
                  className="mb-8 sm:mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="w-full bg-white/10 rounded-full h-1 mb-4 overflow-hidden">
                    <motion.div 
                      className="h-1 bg-gradient-to-r from-[#6BE53D] to-[#6BE53D]/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(checklistStep / 5) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-400">Processing...</span>
                    <span className="text-[#6BE53D] font-medium">
                      {Math.round((checklistStep / 5) * 100)}%
                    </span>
                  </div>
                </motion.div>

                {/* Premium Task List */}
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Analyzing your business data...",
                    "Comparing shipping carriers...",
                    "Calculating cost savings...", 
                    "Generating your strategy...",
                    "Finalizing recommendations..."
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border transition-all duration-500 ${
                        checklistStep > index 
                          ? 'border-[#6BE53D]/50 bg-[#6BE53D]/10' 
                          : checklistStep === index + 1 
                            ? 'border-[#6BE53D] bg-[#6BE53D]/5' 
                            : 'border-white/10 bg-white/5'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <motion.div 
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                            checklistStep > index 
                              ? 'bg-[#6BE53D] text-black' 
                              : checklistStep === index + 1 
                                ? 'bg-[#6BE53D]/20 border-2 border-[#6BE53D]' 
                                : 'bg-white/20'
                          }`}
                          animate={checklistStep === index + 1 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 1, repeat: checklistStep === index + 1 ? Infinity : 0 }}
                        >
                          {checklistStep > index ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </motion.div>
                          ) : checklistStep === index + 1 ? (
                            <motion.div 
                              className="w-2 h-2 sm:w-3 sm:h-3 bg-[#6BE53D] rounded-full"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          ) : (
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full" />
                          )}
                        </motion.div>
                        <span className={`text-sm sm:text-base md:text-lg font-medium transition-colors duration-500 ${
                          checklistStep > index 
                            ? 'text-[#6BE53D]' 
                            : checklistStep === index + 1 
                              ? 'text-white' 
                              : 'text-white/60'
                        }`}>
                          {item}
                        </span>
            </div>
                    </motion.div>
          ))}
        </div>
                  </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Success State */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            className="fixed inset-0 bg-black flex items-center justify-center z-40 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Green gradient background matching home page */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#6BE53D]/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></div>
            
            <motion.div 
              className="w-full max-w-2xl md:max-w-3xl relative z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl text-center">
                
                {/* Success Icon with Animation */}
                <motion.div 
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-r from-[#6BE53D] to-[#6BE53D]/80 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                  </motion.div>
                </motion.div>

                {/* Future Logo */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="mb-6 sm:mb-8"
                >
                  <Image 
                    src="/future-logo-white.svg" 
                    alt="Future Fulfillment" 
                    width={160} 
                    height={36}
                    className="h-6 sm:h-8 w-auto mx-auto" 
                    priority
                  />
                </motion.div>

                {/* Success Content */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 tracking-tight text-white">
                    Analysis Complete!
                </h1>
                  <p className="text-base sm:text-lg md:text-xl text-[#6BE53D] font-light mb-2">
                    Your personalized strategy&nbsp;is&nbsp;ready
                  </p>
                  <motion.p 
                    className="text-gray-400 text-sm sm:text-base"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Redirecting to your&nbsp;results...
                  </motion.p>
                </motion.div>

                {/* Subtle Loading Dots */}
                <motion.div 
                  className="flex justify-center space-x-2 mt-6 sm:mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
              key={i}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#6BE53D] rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
                  </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Progress bar */}
        <div className="w-full bg-gray-800/50 backdrop-blur-sm">
          <div 
            className="h-2 bg-[#6BE53D] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
                  </div>
                  
        {/* Header */}
        <header className="flex items-center justify-between p-6 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Image 
              src="/future-logo-white.svg" 
              alt="Future Fulfillment Logo" 
              width={120} 
              height={28}
              className="h-7 w-auto" 
            />
                  </div>
          <div className="text-sm text-gray-400">
            {page + 1} of {totalPages}
                  </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-4xl">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl shadow-[#6BE53D]/20 drop-shadow-[0_8px_32px_rgba(107,229,61,0.15)] p-8 sm:p-12 rounded-3xl transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[#6BE53D]/30 hover:drop-shadow-[0_12px_48px_rgba(107,229,61,0.25)] hover:border-[#6BE53D]/20 hover:bg-black/30 hover:backdrop-blur-2xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(8px)", y: -20 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.23, 1, 0.32, 1],
                    filter: { duration: 0.3 }
                  }}
                >
                  {currentStep?.kind === "text" && renderTextStep(currentStep)}
                  {currentStep?.kind === "choice" && renderChoiceStep(currentStep)}
                </motion.div>
              </AnimatePresence>
              
              {/* Navigation buttons directly under card content */}
              <div className={`flex mt-8 ${page > 0 ? 'justify-between' : 'justify-end'}`}>
                {/* Back button - only show after first page */}
                {page > 0 && (
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                >
                    <ChevronLeftIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Back</span>
                </button>
                )}
                
                {/* Next/Complete button */}
                {page < totalPages - 1 ? (
                <button
                  onClick={() => setPage((p) => p + 1)}
                    disabled={!isStepValid}
                    className="flex items-center space-x-2 px-8 py-3 bg-[#6BE53D] hover:bg-[#5BC72D] text-black font-medium rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <span>Next</span>
                    <ChevronRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                ) : (
                <button 
                  onClick={handleComplete}
                    disabled={!isStepValid}
                    className="flex items-center space-x-2 px-8 py-3 bg-[#6BE53D] hover:bg-[#5BC72D] text-black font-bold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    <span>Complete</span>
                    <CheckCircleIcon className="w-5 h-5" />
                </button>
                )}
              </div>
            </div>
        </div>
        </main>
      </div>
    </div>
  );
} 