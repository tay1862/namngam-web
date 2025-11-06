'use client';

import { useEffect } from 'react';
import { initAccessibilityChecks } from '@/lib/accessibility';

export default function AccessibilityInitializer() {
  useEffect(() => {
    initAccessibilityChecks();
  }, []);

  return null;
}