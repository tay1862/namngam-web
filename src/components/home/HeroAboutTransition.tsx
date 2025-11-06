'use client';

import { motion } from 'framer-motion';

export default function HeroAboutTransition() {
  return (
    <section className="relative h-32 md:h-40 overflow-hidden">
      {/* Enhanced gradient transition with better flow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/40 to-white/90"></div>
      
      {/* More elegant wave pattern with better curves */}
      <svg
        className="absolute bottom-0 w-full h-24 md:h-32"
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,60 C240,80 480,40 720,55 C960,70 1200,45 1440,60 L1440,120 L0,120 Z"
          fill="url(#smoothGradient)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,80 C360,90 720,70 1080,85 C1260,92 1350,88 1440,90 L1440,120 L0,120 Z"
          fill="url(#secondaryGradient)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="smoothGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDF2F8" />
            <stop offset="25%" stopColor="#FCE7F3" />
            <stop offset="50%" stopColor="#FECDD3" />
            <stop offset="75%" stopColor="#FEF3F2" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FCE7F3" />
            <stop offset="50%" stopColor="#FEF3F2" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Subtle floating elements with better positioning */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          opacity: [0.06, 0.1, 0.06]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-8 left-1/4 w-12 h-12 bg-pink-200/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, -8, 0],
          opacity: [0.04, 0.08, 0.04]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-12 right-1/3 w-8 h-8 bg-pink-300/8 rounded-full blur-2xl"
      />
    </section>
  );
}