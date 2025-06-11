"use client";

import Spline from '@splinetool/react-spline/next';

import { useEffect, useState } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 400);
  const heroTranslate = Math.min(0, -scrollY / 5);

  return (
    <main className="relative min-h-screen bg-motion bg-bottom-glow bg-top-stars text-white">
      {/* Hero Section */}
      <section
        style={{ opacity: heroOpacity, transform: `translateY(${heroTranslate}px)` }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-300"
      >
        {/* Spline Globe */}
        <Spline
          className="absolute inset-0 w-full h-full"
          scene="https://prod.spline.design/4rSGGXlG7TeC2F-0/scene.splinecode"
        />

        {/* Hero Text */}
        <div className="relative z-10 text-center px-6">
          <h1 className="font-bold text-4xl sm:text-6xl md:text-7xl tracking-tight animate-fadeIn">
            Unlock Seamless<br className="hidden sm:block" /> Global Shipping
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-xl mx-auto animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            Supercharge your ecommerce growth with our intelligent fulfilment platform.
          </p>
        </div>
      </section>

      {/* Page Content to allow scrolling */}
      <section className="relative z-10 pt-[100vh] bg-gradient-to-b from-transparent to-black/80">
        <div className="max-w-5xl mx-auto p-8">
          <h2 className="text-3xl font-semibold mb-4">Why choose us?</h2>
          <p className="text-gray-300 mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.
          </p>
          <div className="h-[150vh]"></div>
        </div>
      </section>
    </main>
  );
}
