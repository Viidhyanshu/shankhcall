"use client";

import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Select Dashboard", href: "/select" },
  { label: "Ocean Intelligence", href: "/disaster/ocean" },
  { label: "Forest Intelligence", href: "/disaster/forest" },
];

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/Viidhyanshu/shankhcall",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-root" role="contentinfo">
      {/* Ambient glow blobs */}
      <div className="footer-glow footer-glow-left" aria-hidden="true" />
      <div className="footer-glow footer-glow-right" aria-hidden="true" />

      <div className="footer-inner">
        {/* Top row */}
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo" aria-label="शंखCall logo">
              <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
                <circle cx="18" cy="18" r="17" stroke="url(#fg)" strokeWidth="2" />
                <path
                  d="M11 18c0-3.866 3.134-7 7-7s7 3.134 7 7"
                  stroke="url(#fg)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="18" cy="18" r="3" fill="url(#fg)" />
                <defs>
                  <linearGradient id="fg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00c2ff" />
                    <stop offset="1" stopColor="#0066ff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <p className="footer-brand-name">शंखCall</p>
              <p className="footer-brand-tagline">Unified Citizen + Social Hazard Intelligence</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="footer-nav" aria-label="Footer navigation">
            <p className="footer-section-title">Platform</p>
            <ul className="footer-nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link">
                    <span className="footer-nav-dot" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mission */}
          <div className="footer-mission">
            <p className="footer-section-title">Mission</p>
            <p className="footer-mission-text">
              Empowering citizens and responders with real-time multilingual
              disaster monitoring across ocean and forest ecosystems — built for
              India, designed for the world.
            </p>
            <div className="footer-badges">
              <span className="footer-badge footer-badge-ocean">🌊 Ocean</span>
              <span className="footer-badge footer-badge-forest">🌿 Forest</span>
              <span className="footer-badge footer-badge-ai">⚡ AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" aria-hidden="true" />

        {/* Bottom row */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {year} <span className="footer-copy-brand">शंखCall</span>. Built with ❤️ for a safer planet.
          </p>
          <div className="footer-socials" aria-label="Social links">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="footer-social-btn"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
