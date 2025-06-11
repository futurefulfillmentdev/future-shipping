'use client'
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GradientCardProps {
  step: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
}

export const GradientCard = ({ step, title, description, icon: Icon, delay = 0 }: GradientCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();

      // Calculate mouse position relative to card center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      setMousePosition({ x, y });

      // Calculate rotation (limited range for subtle effect)
      const rotateX = -(y / rect.height) * 5; // Max 5 degrees rotation
      const rotateY = (x / rect.width) * 5; // Max 5 degrees rotation

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  // Reset rotation when not hovering
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
        delay
      }}
      className="w-full flex items-center justify-center"
    >
      {/* Card container with realistic 3D effect */}
      <motion.div
        ref={cardRef}
        className="relative rounded-[32px] overflow-hidden w-full max-w-sm"
        style={{
          height: "380px",
          transformStyle: "preserve-3d",
          backgroundColor: "#0e131f",
          boxShadow: "0 -10px 100px 10px rgba(16, 185, 129, 0.15), 0 0 10px 0 rgba(0, 0, 0, 0.5)",
        }}
        initial={{ y: 0 }}
        animate={{
          y: isHovered ? -5 : 0,
          rotateX: rotation.x,
          rotateY: rotation.y,
          perspective: 1000,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Subtle glass reflection overlay */}
        <motion.div
          className="absolute inset-0 z-35 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(2px)",
          }}
          animate={{
            opacity: isHovered ? 0.7 : 0.5,
            rotateX: -rotation.x * 0.2,
            rotateY: -rotation.y * 0.2,
            z: 1,
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        />

        {/* Dark background with black gradient */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(180deg, #000000 0%, #000000 70%)",
          }}
          animate={{
            z: -1
          }}
        />

        {/* Emerald glow effect replacing purple */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-2/3 z-20"
          style={{
            background: `
              radial-gradient(ellipse at bottom right, rgba(16, 185, 129, 0.6) -10%, rgba(20, 184, 166, 0) 70%),
              radial-gradient(ellipse at bottom left, rgba(34, 197, 94, 0.6) -10%, rgba(16, 185, 129, 0) 70%)
            `,
            filter: "blur(40px)",
          }}
          animate={{
            opacity: isHovered ? 0.9 : 0.7,
            y: isHovered ? rotation.x * 0.5 : 0,
            z: 0
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        />

        {/* Central emerald glow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-2/3 z-21"
          style={{
            background: `
              radial-gradient(circle at bottom center, rgba(16, 185, 129, 0.7) -20%, rgba(20, 184, 166, 0) 60%)
            `,
            filter: "blur(45px)",
          }}
          animate={{
            opacity: isHovered ? 0.85 : 0.75,
            y: isHovered ? `calc(10% + ${rotation.x * 0.3}px)` : "10%",
            z: 0
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        />

        {/* Enhanced bottom border glow with emerald colors */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
          style={{
            background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)",
          }}
          animate={{
            boxShadow: isHovered
              ? "0 0 20px 4px rgba(16, 185, 129, 0.9), 0 0 30px 6px rgba(34, 197, 94, 0.7), 0 0 40px 8px rgba(20, 184, 166, 0.5)"
              : "0 0 15px 3px rgba(16, 185, 129, 0.8), 0 0 25px 5px rgba(34, 197, 94, 0.6), 0 0 35px 7px rgba(20, 184, 166, 0.4)",
            opacity: isHovered ? 1 : 0.9,
            z: 0.5
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
        />

        {/* Card content */}
        <motion.div
          className="relative flex flex-col h-full p-8 z-40"
          animate={{
            z: 2
          }}
        >
          {/* Icon circle with shadow */}
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
              position: "relative",
              overflow: "hidden"
            }}
            initial={{ filter: "blur(3px)", opacity: 0.7 }}
            animate={{
              filter: "blur(0px)",
              opacity: 1,
              boxShadow: isHovered
                ? "0 8px 16px -2px rgba(0, 0, 0, 0.3), 0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.7)"
                : "0 6px 12px -2px rgba(0, 0, 0, 0.25), 0 3px 6px -1px rgba(0, 0, 0, 0.15), inset 1px 1px 3px rgba(255, 255, 255, 0.12), inset -2px -2px 4px rgba(0, 0, 0, 0.5)",
              z: isHovered ? 10 : 5,
              y: isHovered ? -2 : 0,
              rotateX: isHovered ? -rotation.x * 0.5 : 0,
              rotateY: isHovered ? -rotation.y * 0.5 : 0
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut"
            }}
          >
            {/* Top-left highlight for realistic lighting */}
            <div
              className="absolute top-0 left-0 w-2/3 h-2/3 opacity-40"
              style={{
                background: "radial-gradient(circle at top left, rgba(255, 255, 255, 0.5), transparent 80%)",
                pointerEvents: "none",
                filter: "blur(10px)"
              }}
            />

            {/* Icon */}
            <div className="flex items-center justify-center w-full h-full relative z-10">
              <Icon className="w-6 h-6 text-emerald-400" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="mb-auto"
            animate={{
              z: isHovered ? 5 : 2,
              rotateX: isHovered ? -rotation.x * 0.3 : 0,
              rotateY: isHovered ? -rotation.y * 0.3 : 0
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut"
            }}
          >
            {/* Step number */}
            <motion.div
              className="text-emerald-300 text-sm font-medium mb-2"
              initial={{ filter: "blur(3px)", opacity: 0.7 }}
              animate={{
                filter: "blur(0px)",
                opacity: 1,
                transition: { duration: 1.2, delay: 0.1 }
              }}
            >
              {step}
            </motion.div>

            <motion.h3
              className="text-xl font-bold text-white mb-4 leading-tight"
              initial={{ filter: "blur(3px)", opacity: 0.7 }}
              animate={{
                textShadow: isHovered ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                filter: "blur(0px)",
                opacity: 1,
                transition: { duration: 1.2, delay: 0.2 }
              }}
            >
              {title}
            </motion.h3>

            <motion.p
              className="text-sm text-gray-300 leading-relaxed"
              initial={{ filter: "blur(3px)", opacity: 0.7 }}
              animate={{
                textShadow: isHovered ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                filter: "blur(0px)",
                opacity: 0.85,
                transition: { duration: 1.2, delay: 0.4 }
              }}
            >
              {description}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 