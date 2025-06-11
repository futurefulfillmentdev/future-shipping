"use client";

import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Load Spline dynamically client-side only
const Spline = dynamic(() => import("@splinetool/react-spline").then((m:any)=>m.default), { ssr: false });

export default function Globe3D() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0613] pb-10 pt-32 font-light text-white antialiased md:pb-16 md:pt-20"
      style={{ background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)" }}
    >
      {/* subtle radial glows */}
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)" }}
      />
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)" }}
      />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center md:px-6 lg:max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#9b87f5]">
            NEXT GENERATION OF SHIPPING OPTIMISATION
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl md:text-5xl lg:text-7xl font-light">
            Reduce Costs with our <span className="text-[#9b87f5]">AI-Powered</span> Shipping Insights
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70 md:text-xl">
            Our platform merges artificial intelligence with real shipping data from 1,000+ brands so you always ship the
            cheapest way possible.
          </p>

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/quiz"
              className="neumorphic-button relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/30 hover:shadow-[0_0_20px_rgba(155,135,245,0.5)] sm:w-auto"
            >
              Get Started
            </Link>
            <a
              href="#learn-more"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
            >
              <span>Learn how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
          </div>
        </motion.div>
        {/* 3D Globe */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div className="w-full flex h-64 md:h-96 relative">
            <Suspense fallback={null}>
              <Spline
                className="absolute inset-0 w-full h-full object-cover"
                scene="https://prod.spline.design/4rSGGXlG7TeC2F-0/scene.splinecode"
              />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 