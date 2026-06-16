"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",
        background: "rgba(6, 9, 19, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0, 194, 255, 0.12)",
        marginTop: "auto",
      }}
    >
      {/* Ambient glow — left */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -140,
          bottom: -80,
          width: 500,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,194,255,0.22) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />
      {/* Ambient glow — right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -140,
          top: -60,
          width: 500,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,102,255,0.18) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "3rem 2rem 2rem",
        }}
      >
        {/* ── Top grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            alignItems: "start",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
            <div
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #00c2ff, #0066ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(0, 194, 255, 0.4)",
                border: "1px solid rgba(0, 194, 255, 0.2)",
              }}
            >
              <i className="fa-solid fa-cloud-showers-water" style={{ color: "#ffffff", fontSize: "0.95rem" }}></i>
            </div>
            <div>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  background: "linear-gradient(to right, #ffffff, #22d3ee, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                शंखCall
              </p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.2rem 0 0", lineHeight: 1.5 }}>
                Unified Citizen + Social Hazard Intelligence
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(0,194,255,0.75)",
                marginBottom: "1rem",
              }}
            >
              Platform
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (pathname === "/" && link.href !== "/") {
                        e.preventDefault();
                        alert("Please login first.");
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#e2e8f0";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "rgba(0,194,255,0.55)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission */}
          <div>
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(0,194,255,0.75)",
                marginBottom: "1rem",
              }}
            >
              Mission
            </p>
            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.75 }}>
              Empowering citizens and responders with real-time multilingual disaster monitoring
              across ocean and forest ecosystems — built for India, designed for the world.
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            height: 1,
            margin: "2.5rem 0 1.75rem",
            background:
              "linear-gradient(to right, transparent, rgba(0,194,255,0.22), rgba(0,102,255,0.15), transparent)",
          }}
        />

        {/* ── Bottom row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0 }}>
            © {year}{" "}
            <span style={{ color: "#38bdf8", fontWeight: 600 }}>शंखCall</span>
            . Built with ❤️ for a safer planet.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2.25rem",
                  height: "2.25rem",
                  borderRadius: 10,
                  color: "#64748b",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(0,194,255,0.12)",
                  textDecoration: "none",
                  transition: "color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#00c2ff";
                  el.style.background = "rgba(0,194,255,0.1)";
                  el.style.borderColor = "rgba(0,194,255,0.4)";
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 6px 20px rgba(0,194,255,0.22)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#64748b";
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(0,194,255,0.12)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
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
