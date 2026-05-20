export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Board body */}
      <rect x="3" y="7" width="34" height="26" rx="3" fill="#1a2236" stroke="#2a3a5c" strokeWidth="1.5"/>
      {/* Stand */}
      <path d="M15 33 L13 38" stroke="#2a3a5c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M25 33 L27 38" stroke="#2a3a5c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 38 L28 38" stroke="#2a3a5c" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Ledge */}
      <rect x="3" y="7" width="34" height="3" rx="2" fill="#2a3a5c"/>
      {/* Text lines on board */}
      <line x1="9" y1="17" x2="22" y2="17" stroke="#3b6ef5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="22" x2="19" y2="22" stroke="#3b6ef5" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <line x1="9" y1="27" x2="25" y2="27" stroke="#3b6ef5" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      {/* Accent dot */}
      <circle cx="31" cy="17" r="3" fill="#3b6ef5"/>
      <path d="M29.5 17 L30.5 18 L32.8 15.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
