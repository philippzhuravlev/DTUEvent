import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import '../styles/ThemeToggle.css';

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  return (
    <label className="theme-slider">
      <input
        type="checkbox"
        checked={dark}
        onChange={() => setDark(d => !d)}
        aria-label="Toggle dark mode"
      />
      <span className="track">
        <span className="thumb">
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </span>
      </span>
    </label>
  );
}