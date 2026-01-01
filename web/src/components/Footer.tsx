'use client';

import Link from 'next/link';

export function Footer() {
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explainer', href: '/explainer' },
    { name: 'Simulator', href: '/simulator' },
  ];

  return (
    <footer className="border-t py-8" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
              ML Drift Detection
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              An interactive explainer demonstrating how statistical drift detection can miss concept drift in machine learning models.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/calebyhan/ml-drift-detection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://archive.ics.uci.edu/ml/datasets/bike+sharing+dataset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  UCI Dataset
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            © {new Date().getFullYear()} ML Drift Detection. Data from UCI Machine Learning Repository.
          </p>
        </div>
      </div>
    </footer>
  );
}
