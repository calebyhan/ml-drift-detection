'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Github } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Explainer', href: '/explainer' },
    { name: 'Simulator', href: '/simulator' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-lg transition-colors"
              style={{ color: 'var(--text)' }}
            >
              <img src="/icon.svg" alt="Logo" className="w-8 h-8" />
              
              <span>ML Drift Detection</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  color: pathname === item.href ? 'var(--accent)' : 'var(--text-secondary)',
                  backgroundColor: pathname === item.href ? 'var(--background)' : 'transparent',
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* GitHub Link */}
            <a
              href="https://github.com/calebyhan/ml-drift-detection"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Github size={18} />
              <span className="hidden lg:inline">GitHub</span>
            </a>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all text-left"
                  style={{
                    color: pathname === item.href ? 'var(--accent)' : 'var(--text-secondary)',
                    backgroundColor: pathname === item.href ? 'var(--background)' : 'transparent',
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <a
                href="https://github.com/calebyhan/ml-drift-detection"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Github size={18} />
                GitHub
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
