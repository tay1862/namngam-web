// Accessibility utilities for NAMNGAM

// Keyboard navigation helpers
export const keyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
} as const;

// ARIA roles and labels
export const ariaRoles = {
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
  BANNER: 'banner',
  SEARCH: 'search',
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
} as const;

// ARIA properties
export const ariaProperties = {
  LABEL: 'aria-label',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
  EXPANDED: 'aria-expanded',
  HIDDEN: 'aria-hidden',
  PRESSED: 'aria-pressed',
  SELECTED: 'aria-selected',
  DISABLED: 'aria-disabled',
  REQUIRED: 'aria-required',
  INVALID: 'aria-invalid',
  CURRENT: 'aria-current',
  CONTROLS: 'aria-controls',
  HASPOPUP: 'aria-haspopup',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic',
  BUSY: 'aria-busy',
  RELEVANT: 'aria-relevant',
} as const;

// Focus management
export class FocusManager {
  private focusableElements: string[] = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  getFocusableElements(container: Element): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableElements.join(', '))
    ) as HTMLElement[];
  }

  trapFocus(container: Element): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key !== keyboardKeys.TAB) return;

      if (keyboardEvent.shiftKey) {
        if (document.activeElement === firstElement) {
          keyboardEvent.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          keyboardEvent.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  restoreFocus(previousElement: HTMLElement | null): void {
    if (previousElement) {
      previousElement.focus();
    }
  }
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private element: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.element = document.createElement('div');
      this.element.setAttribute('aria-live', 'polite');
      this.element.setAttribute('aria-atomic', 'true');
      this.element.style.position = 'absolute';
      this.element.style.left = '-10000px';
      this.element.style.width = '1px';
      this.element.style.height = '1px';
      this.element.style.overflow = 'hidden';
      document.body.appendChild(this.element);
    }
  }

  announce(message: string): void {
    if (this.element) {
      this.element.textContent = '';
      setTimeout(() => {
        if (this.element) {
          this.element.textContent = message;
        }
      }, 100);
    }
  }

  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

// Color contrast utilities
export const colorContrast = {
  // Check if color has sufficient contrast (simplified version)
  hasGoodContrast(textColor: string, backgroundColor: string): boolean {
    // This is a simplified check - in production, use a proper contrast calculation library
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calculate relative luminance
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(textColor);
    const l2 = getLuminance(backgroundColor);
    const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return contrast >= 4.5; // WCAG AA standard
  },
};

// Skip links utility
export const createSkipLinks = (): HTMLElement[] => {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
  ];

  return skipLinks.map(link => {
    const skipLink = document.createElement('a');
    skipLink.href = link.href;
    skipLink.textContent = link.text;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-500 text-white px-4 py-2 rounded-md z-50';
    return skipLink;
  });
};

// Heading hierarchy checker
export const checkHeadingHierarchy = (): void => {
  if (typeof window === 'undefined') return;
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.substring(1));
    
    if (currentLevel > previousLevel + 1) {
      console.warn(`Heading level skipped at element ${index}: h${previousLevel} to h${currentLevel}`);
    }
    
    previousLevel = currentLevel;
  });
};

// Image alt text checker
export const checkImageAltText = (): void => {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt && img.alt !== '') {
      console.warn(`Image missing alt text at index ${index}:`, img);
    }
  });
};

// Link text checker
export const checkLinkText = (): void => {
  if (typeof window === 'undefined') return;
  
  const links = document.querySelectorAll('a[href]');
  links.forEach((link, index) => {
    const text = link.textContent?.trim();
    if (!text || text === '') {
      console.warn(`Link missing descriptive text at index ${index}:`, link);
    }
  });
};

// Initialize accessibility checks (development only)
export const initAccessibilityChecks = (): void => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  // Run checks after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        checkHeadingHierarchy();
        checkImageAltText();
        checkLinkText();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      checkHeadingHierarchy();
      checkImageAltText();
      checkLinkText();
    }, 1000);
  }
};

// Export singleton instances
export const focusManager = new FocusManager();
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();