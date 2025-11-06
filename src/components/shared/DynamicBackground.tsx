'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addCacheBusting } from '@/lib/performance';

interface DynamicBackgroundProps {
  type: 'homeBg' | 'aboutBg' | 'productsBg' | 'articlesBg';
  fallbackClass?: string;
  children: React.ReactNode;
  brightness?: number;
  overlayOpacity?: number;
}

export default function DynamicBackground({ 
  type, 
  fallbackClass = 'bg-gradient-to-br from-pink-50 via-white to-pink-50',
  children,
  brightness = 0.8,
  overlayOpacity = 0.9
}: DynamicBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public/settings');
        const data = await res.json();
        if (data.success) {
          const imageUrl = data.data[type] || '';
          // Add cache busting to prevent browser caching issues
          setBackgroundImage(imageUrl ? addCacheBusting(imageUrl) : '');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [type]);

  return (
    <section className="relative">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: `brightness(${brightness})` }}
          />
          <div 
            className="absolute inset-0 bg-white"
            style={{ opacity: overlayOpacity }}
          ></div>
        </div>
      )}
      
      {/* Fallback gradient background */}
      {!backgroundImage && <div className={`absolute inset-0 ${fallbackClass}`}></div>}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}