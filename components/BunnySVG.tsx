interface BunnySVGProps {
  /** Accent color applied to inner ears, bow tie, and cheeks. */
  color?: string
  size?: number
}

export default function BunnySVG({ color = '#FFB7C5', size = 120 }: BunnySVGProps) {
  const fur     = '#F8F4EC'  // warm cream body
  const outline = '#C8A882'  // warm brown cartoon stroke
  const sw      = 1.8        // stroke width
  const eyeCol  = '#3D2B1F'
  const noseCol = '#E8707A'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* TAIL (behind body) */}
      <circle cx="85" cy="92" r="9" fill={fur} stroke={outline} strokeWidth={sw} />

      {/* BODY */}
      <ellipse cx="60" cy="90" rx="24" ry="20" fill={fur} stroke={outline} strokeWidth={sw} />

      {/* FEET */}
      <ellipse cx="46" cy="109" rx="13" ry="7" fill={fur} stroke={outline} strokeWidth={sw} />
      <ellipse cx="74" cy="109" rx="13" ry="7" fill={fur} stroke={outline} strokeWidth={sw} />

      {/* EARS — behind head */}
      <ellipse cx="39" cy="22" rx="11" ry="22" fill={fur} stroke={outline} strokeWidth={sw} />
      <ellipse cx="39" cy="23" rx="6"  ry="15" fill={color} />
      <ellipse cx="81" cy="22" rx="11" ry="22" fill={fur} stroke={outline} strokeWidth={sw} />
      <ellipse cx="81" cy="23" rx="6"  ry="15" fill={color} />

      {/* HEAD */}
      <circle cx="60" cy="52" r="26" fill={fur} stroke={outline} strokeWidth={sw} />

      {/* ARMS / FRONT PAWS */}
      <ellipse cx="37" cy="87" rx="9" ry="13" fill={fur} stroke={outline} strokeWidth={sw} />
      <ellipse cx="83" cy="87" rx="9" ry="13" fill={fur} stroke={outline} strokeWidth={sw} />

      {/* CHEEKS */}
      <circle cx="46" cy="59" r="7" fill={color} opacity="0.45" />
      <circle cx="74" cy="59" r="7" fill={color} opacity="0.45" />

      {/* EYES */}
      <circle cx="50" cy="50" r="4"   fill={eyeCol} />
      <circle cx="70" cy="50" r="4"   fill={eyeCol} />
      <circle cx="51.5" cy="48.5" r="1.5" fill="white" />
      <circle cx="71.5" cy="48.5" r="1.5" fill="white" />

      {/* NOSE */}
      <ellipse cx="60" cy="56" rx="2.5" ry="2" fill={noseCol} />

      {/* MOUTH */}
      <path d="M 57 58 Q 60 62 63 58" stroke={noseCol} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* WHISKERS */}
      <line x1="34" y1="55" x2="50" y2="57" stroke={outline} strokeWidth="0.8" opacity="0.6" />
      <line x1="34" y1="58" x2="50" y2="58" stroke={outline} strokeWidth="0.8" opacity="0.6" />
      <line x1="70" y1="57" x2="86" y2="55" stroke={outline} strokeWidth="0.8" opacity="0.6" />
      <line x1="70" y1="58" x2="86" y2="58" stroke={outline} strokeWidth="0.8" opacity="0.6" />

      {/* BOW TIE */}
      <path d="M 60 74 L 49 69 L 49 79 Z" fill={color} stroke={outline} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M 60 74 L 71 69 L 71 79 Z" fill={color} stroke={outline} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="60" cy="74" r="3" fill={color} stroke={outline} strokeWidth="1.2" />
    </svg>
  )
}
