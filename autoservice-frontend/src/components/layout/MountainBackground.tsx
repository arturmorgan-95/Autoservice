export function MountainBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-bg-primary" />

      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.8 ? '2px' : '1px',
              height: Math.random() > 0.8 ? '2px' : '1px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 70}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,420 L0,280 L80,220 L160,260 L240,180 L320,220 L400,140 L480,200 L560,120 L640,180 L720,100 L800,160 L880,80 L960,150 L1040,90 L1120,160 L1200,120 L1280,180 L1360,140 L1440,200 L1440,420 Z"
          fill="rgba(30, 10, 60, 0.7)"
        />
        <path
          d="M380,140 L400,140 L420,155 L400,158 Z"
          fill="rgba(200,180,255,0.25)"
        />
        <path
          d="M700,100 L720,100 L740,118 L720,122 Z"
          fill="rgba(200,180,255,0.25)"
        />
        <path
          d="M860,80 L880,80 L900,100 L880,104 Z"
          fill="rgba(200,180,255,0.25)"
        />
        <path
          d="M1020,90 L1040,90 L1060,108 L1040,112 Z"
          fill="rgba(200,180,255,0.25)"
        />
      </svg>

      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,300 L0,240 L120,170 L200,210 L300,150 L380,190 L460,130 L540,180 L620,110 L700,160 L780,120 L860,170 L940,100 L1020,155 L1100,130 L1180,175 L1260,140 L1340,180 L1440,150 L1440,300 Z"
          fill="rgba(15, 5, 40, 0.85)"
        />
        <path d="M442,130 L460,130 L478,148 L460,152 Z" fill="rgba(200,180,255,0.2)" />
        <path d="M604,110 L622,110 L640,128 L622,132 Z" fill="rgba(200,180,255,0.2)" />
        <path d="M924,100 L942,100 L960,118 L942,122 Z" fill="rgba(200,180,255,0.2)" />
      </svg>

      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: 'linear-gradient(to top, rgba(109, 40, 217, 0.15) 0%, transparent 100%)',
        }}
      />

      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  )
}
