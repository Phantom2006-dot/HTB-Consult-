import { useEffect, useRef } from "react";

const steps = [
  {
    num: "01",
    label: "Foundation",
    colorClass: "card-blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        <line x1="9" y1="7" x2="15" y2="7"/>
        <line x1="9" y1="11" x2="15" y2="11"/>
      </svg>
    ),
  },
  {
    num: "02",
    label: "Practical\nApplication",
    colorClass: "card-teal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <polyline points="8 21 12 17 16 21"/>
        <polyline points="7 10 10 13 15 8"/>
      </svg>
    ),
  },
  {
    num: "03",
    label: "Domain\nSpecialisation",
    colorClass: "card-purple",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
        <path d="M16.24 7.76a6 6 0 010 8.49"/>
      </svg>
    ),
  },
  {
    num: "04",
    label: "Industry Project\n& Mentorship",
    colorClass: "card-green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

const pillars = [
  {
    title: "Structured",
    desc: "A clear progression from foundation to industry impact.",
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8l4 4-4 4"/>
        <path d="M8 12h8"/>
      </svg>
    ),
  },
  {
    title: "Practical",
    desc: "Hands-on learning, simulations and real project experience.",
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
  },
  {
    title: "Career Focused",
    desc: "Build the skills and confidence to grow and get hired.",
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 8l3 3 5-5"/>
      </svg>
    ),
  },
];

const bottomOffsets = [0, 30, 65, 100];
const leftOffsets  = [0, 130, 260, 390];

export default function LearningPathwayHero() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

        .lp-hero {
          width: 100%;
          background: linear-gradient(135deg, #0a1628 0%, #0f1f42 40%, #0d1a38 70%, #0c1930 100%);
          padding: 48px 56px 56px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          color: white;
          min-height: 280px;
          box-sizing: border-box;
        }
        .lp-hero * { box-sizing: border-box; }

        .lp-grid {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .lp-breadcrumb {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          margin-bottom: 22px;
          position: relative;
          z-index: 1;
        }
        .lp-breadcrumb span { color: white; opacity: 0.9; }

        .lp-layout {
          display: flex;
          align-items: center;
          gap: 32px;
          position: relative;
          z-index: 1;
        }

        .lp-left {
          flex: 0 0 340px;
          max-width: 340px;
        }

        .lp-h1 {
          font-family: 'Sora', sans-serif;
          font-size: 32px;
          font-weight: 800;
          line-height: 1.15;
          color: white;
          margin: 0 0 14px;
          letter-spacing: -0.3px;
        }

        .lp-subtitle {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.65);
          margin: 0 0 28px;
          max-width: 290px;
        }

        .lp-pillars { display: flex; gap: 28px; }
        .lp-pillar { flex: 1; }
        .lp-pillar-icon { margin-bottom: 7px; opacity: 0.9; display: block; }
        .lp-pillar-title {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }
        .lp-pillar-desc {
          font-size: 11.5px;
          line-height: 1.55;
          color: rgba(255,255,255,0.6);
        }

        /* Staircase */
        .lp-stair-wrap {
          flex: 1;
          position: relative;
          height: 220px;
        }

        .lp-stair-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .lp-steps-container {
          position: absolute;
          inset: 0;
        }

        .lp-step-slot {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Card styles */
        .lp-card {
          border-radius: 10px;
          padding: 14px 14px 12px;
          width: 115px;
          text-align: center;
          position: relative;
        }

        @keyframes lp-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }

        .card-blue {
          background: linear-gradient(160deg, #1a3a6e 0%, #0f2550 100%);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: lp-float 3s ease-in-out infinite;
          animation-delay: 0s;
        }
        .card-teal {
          background: linear-gradient(160deg, #1b5e80 0%, #0d4060 100%);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          animation: lp-float 3s ease-in-out infinite;
          animation-delay: 0.4s;
        }
        .card-purple {
          background: linear-gradient(160deg, #4a2080 0%, #2d1260 100%);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          animation: lp-float 3s ease-in-out infinite;
          animation-delay: 0.8s;
        }
        .card-green {
          background: linear-gradient(160deg, #2d6a4f 0%, #1b4332 100%);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
          animation: lp-float 3s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        .lp-card-num {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: center;
        }
        .lp-card-num::before {
          content: '';
          display: inline-block;
          width: 4px; height: 4px;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
        }

        .lp-card-icon-wrap {
          width: 42px; height: 42px;
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 10px;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .lp-card-label {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: pre-line;
        }

        @keyframes lp-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.4;  transform: scale(1.3); }
        }
        .lp-dot {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          animation: lp-pulse 2s ease-in-out infinite;
          z-index: 0;
        }
      `}</style>

      <section className="lp-hero">
        <div className="lp-grid" />

        {/* Decorative dots */}
        <div className="lp-dot" style={{ top: 20, right: 80, animationDelay: "0s" }} />
        <div className="lp-dot" style={{ top: 60, right: 200, animationDelay: "0.7s" }} />
        <div className="lp-dot" style={{ top: 30, left: 340, width: 4, height: 4, animationDelay: "1.4s" }} />

        {/* Breadcrumb */}
        <div className="lp-breadcrumb">
          Home &nbsp;›&nbsp; <span>Learning Pathways</span>
        </div>

        <div className="lp-layout">
          {/* LEFT */}
          <div className="lp-left">
            <h1 className="lp-h1">Your Journey to<br/>Industry Impact</h1>
            <p className="lp-subtitle">
              A structured learning pathway designed to turn aspiring Business Analysts into industry-ready professionals.
            </p>
            <div className="lp-pillars">
              {pillars.map((p) => (
                <div className="lp-pillar" key={p.title}>
                  <span className="lp-pillar-icon">{p.icon}</span>
                  <div className="lp-pillar-title">{p.title}</div>
                  <div className="lp-pillar-desc">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — staircase */}
          <div className="lp-stair-wrap">
            {/* SVG stair platform + connectors + arrow */}
            <svg className="lp-stair-svg" viewBox="0 0 520 230" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              {/* Step platforms */}
              <polygon points="10,180 130,180 130,200 10,200"   fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              <polygon points="10,200 130,200 130,220 10,220"   fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
              <polygon points="130,150 260,150 260,170 130,170" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              <polygon points="130,170 260,170 260,200 130,200" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
              <polygon points="260,115 390,115 390,135 260,135" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              <polygon points="260,135 390,135 390,170 260,170" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
              <polygon points="390,78 510,78 510,98 390,98"     fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              <polygon points="390,98 510,98 510,135 390,135"   fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>

              {/* Dashed connectors */}
              <line x1="120" y1="160" x2="140" y2="145" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>
              <line x1="250" y1="128" x2="270" y2="112" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>
              <line x1="380" y1="93"  x2="400" y2="77"  stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>

              {/* Arrow */}
              <g transform="translate(490,10)">
                <polygon points="0,80 8,0 16,80" fill="white" opacity="0.85"/>
                <rect x="5" y="75" width="6" height="30" fill="white" opacity="0.85" rx="1"/>
              </g>
            </svg>

            {/* Cards */}
            <div className="lp-steps-container">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="lp-step-slot"
                  style={{ left: leftOffsets[i], bottom: bottomOffsets[i] }}
                >
                  <div className={`lp-card ${step.colorClass}`}>
                    <div className="lp-card-num">{step.num}</div>
                    <div className="lp-card-icon-wrap">{step.icon}</div>
                    <div className="lp-card-label">{step.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
