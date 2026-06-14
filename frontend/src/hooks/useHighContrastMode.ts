import { useState, useEffect } from 'react';

export function useHighContrastMode() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    let hc = false;
    try {
      if (typeof window !== 'undefined') {
        hc = localStorage.getItem('high-contrast') === 'true';
      }
    } catch (err) {
      console.error('Failed to read high-contrast from localStorage:', err);
    }
    setHighContrast(hc);
    if (hc) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleHighContrast = (checked: boolean) => {
    setHighContrast(checked);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('high-contrast', checked ? 'true' : 'false');
      }
    } catch (err) {
      console.error('Failed to write high-contrast to localStorage:', err);
    }
    if (checked) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return { highContrast, toggleHighContrast };
}
