import React from 'react';

interface AvatarProps {
  isSpeaking?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TutankhamunAvatar: React.FC<AvatarProps> = ({
  isSpeaking = false,
  isLoading = false,
  size = 'md',
}) => {
  const dimension = size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-36 h-36 md:w-44 md:h-44' : 'w-24 h-24 md:w-28 md:h-28';

  return (
    <div className={`relative flex items-center justify-center ${dimension} select-none`}>
      {/* Outer ambient golden halo */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isLoading
            ? 'bg-amber-400/30 blur-xl animate-pulse scale-125'
            : isSpeaking
            ? 'bg-amber-500/25 blur-lg scale-110'
            : 'bg-amber-600/15 blur-md'
        }`}
      />

      {/* Royal Cartouche Frame Border */}
      <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-b from-amber-300 via-amber-600 to-amber-900 shadow-2xl ring-2 ring-amber-400/40">
        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#141b2b] to-[#0a0e17] overflow-hidden flex items-center justify-center relative">
          
          {/* Subtle Hieroglyphs in background */}
          <svg
            className="absolute inset-0 w-full h-full opacity-15"
            viewBox="0 0 100 100"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.5"
          >
            <path d="M 15,20 Q 25,10 35,20 L 35,35 Q 25,45 15,35 Z" />
            <circle cx="75" cy="25" r="8" />
            <path d="M 75,33 L 75,48 M 68,40 L 82,40" />
            <path d="M 20,70 C 30,60 40,80 50,70 C 60,60 70,80 80,70" />
          </svg>

          {/* Detailed Egyptian Nemes & Golden Mask SVG */}
          <svg
            viewBox="0 0 200 220"
            className="w-full h-full object-contain filter drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gold gradient */}
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3b0" />
                <stop offset="25%" stopColor="#f59e0b" />
                <stop offset="60%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Lapis Lazuli gradient */}
              <linearGradient id="lapisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>

              {/* Dark Gold Shadow */}
              <linearGradient id="goldShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>

            {/* NEMES HEADCLOTH FLAPS (Lapis & Gold Stripes) */}
            {/* Background wings of the Nemes */}
            <path
              d="M 30,100 L 15,160 L 55,165 L 60,110 Z"
              fill="url(#lapisGrad)"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <path
              d="M 170,100 L 185,160 L 145,165 L 140,110 Z"
              fill="url(#lapisGrad)"
              stroke="#d97706"
              strokeWidth="1.5"
            />

            {/* Stripes on left flap */}
            <path d="M 27,112 L 57,120" stroke="#fef08a" strokeWidth="4" />
            <path d="M 23,126 L 55,134" stroke="#fef08a" strokeWidth="4" />
            <path d="M 19,140 L 54,148" stroke="#fef08a" strokeWidth="4" />
            <path d="M 16,154 L 54,160" stroke="#fef08a" strokeWidth="3" />

            {/* Stripes on right flap */}
            <path d="M 173,112 L 143,120" stroke="#fef08a" strokeWidth="4" />
            <path d="M 177,126 L 145,134" stroke="#fef08a" strokeWidth="4" />
            <path d="M 181,140 L 146,148" stroke="#fef08a" strokeWidth="4" />
            <path d="M 184,154 L 146,160" stroke="#fef08a" strokeWidth="3" />

            {/* Upper Nemes Crown Dome */}
            <path
              d="M 40,80 C 40,25 160,25 160,80 C 160,100 150,115 140,120 C 130,70 70,70 60,120 C 50,115 40,100 40,80 Z"
              fill="url(#goldGrad)"
              stroke="#92400e"
              strokeWidth="2"
            />

            {/* Nemes Horizontal Stripes on Crown */}
            <path d="M 46,45 C 65,30 135,30 154,45" fill="none" stroke="url(#lapisGrad)" strokeWidth="6" />
            <path d="M 42,60 C 65,45 135,45 158,60" fill="none" stroke="url(#lapisGrad)" strokeWidth="6" />
            <path d="M 40,75 C 65,60 135,60 160,75" fill="none" stroke="url(#lapisGrad)" strokeWidth="6" />

            {/* ROYAL URAEUS (Cobra & Vulture on Forehead) */}
            <circle cx="100" cy="40" r="5" fill="#ef4444" stroke="#fbbf24" strokeWidth="1" />
            <path d="M 100,35 Q 106,20 100,16 Q 94,14 100,8" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
            <circle cx="100" cy="8" r="2.5" fill="#ef4444" />

            {/* GOLDEN FACE */}
            <path
              d="M 64,85 C 64,65 136,65 136,85 C 136,125 125,145 100,150 C 75,145 64,125 64,85 Z"
              fill="url(#goldGrad)"
              stroke="#b45309"
              strokeWidth="2"
            />

            {/* EARS with Royal Perforated Lobes */}
            <path d="M 58,90 Q 52,98 58,106 Q 62,110 65,108" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            <circle cx="59" cy="105" r="1.5" fill="#451a03" />
            <path d="M 142,90 Q 148,98 142,106 Q 138,110 135,108" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            <circle cx="141" cy="105" r="1.5" fill="#451a03" />

            {/* KOHL EYEBROWS & EYES (Ancient Egyptian Style) */}
            {/* Left Eyebrow */}
            <path d="M 70,82 Q 80,77 92,82 L 95,83" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            {/* Right Eyebrow */}
            <path d="M 108,82 Q 120,77 130,82 L 133,83" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

            {/* Left Eye */}
            <ellipse cx="82" cy="90" rx="9" ry="5.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.8" />
            {/* Right Eye */}
            <ellipse cx="118" cy="90" rx="9" ry="5.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.8" />

            {/* Kohl eye extensions */}
            <path d="M 73,90 L 68,91" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            <path d="M 127,90 L 132,91" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

            {/* Pupils - subtle animation if speaking/loading */}
            <circle
              cx={isLoading ? '83' : '82'}
              cy="90"
              r="3.5"
              fill={isLoading ? '#0284c7' : '#1e1b4b'}
              className={isLoading ? 'animate-ping' : ''}
            />
            <circle cx="81" cy="89" r="1" fill="#ffffff" />

            <circle
              cx={isLoading ? '119' : '118'}
              cy="90"
              r="3.5"
              fill={isLoading ? '#0284c7' : '#1e1b4b'}
              className={isLoading ? 'animate-ping' : ''}
            />
            <circle cx="117" cy="89" r="1" fill="#ffffff" />

            {/* NOSE */}
            <path d="M 100,86 L 98,104 Q 95,108 100,109 Q 105,108 102,104 Z" fill="#d97706" opacity="0.4" />
            <path d="M 97,105 Q 100,109 103,105" fill="none" stroke="#78350f" strokeWidth="1.5" />

            {/* NOBLE MOUTH */}
            <path
              d={isSpeaking ? 'M 92,120 Q 100,126 108,120 Q 100,124 92,120 Z' : 'M 93,122 Q 100,126 107,122'}
              fill={isSpeaking ? '#881337' : 'none'}
              stroke="#9f1239"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line x1="91" y1="122" x2="109" y2="122" stroke="#4c0519" strokeWidth="1" />

            {/* DIVINE GOLDEN BEARD (Pharaonic ceremonial braided beard) */}
            <path
              d="M 94,148 L 93,185 Q 100,195 107,185 L 106,148 Z"
              fill="url(#goldShadow)"
              stroke="#78350f"
              strokeWidth="1.5"
            />
            {/* Lapis braiding on beard */}
            <line x1="94" y1="156" x2="106" y2="156" stroke="url(#lapisGrad)" strokeWidth="3" />
            <line x1="94" y1="166" x2="106" y2="166" stroke="url(#lapisGrad)" strokeWidth="3" />
            <line x1="94" y1="176" x2="106" y2="176" stroke="url(#lapisGrad)" strokeWidth="3" />

            {/* COLLAR (Usekh Broad Collar) */}
            <path
              d="M 60,165 Q 100,195 140,165 Q 155,190 160,205 Q 100,230 40,205 Q 45,190 60,165 Z"
              fill="url(#goldGrad)"
              stroke="#92400e"
              strokeWidth="1.5"
            />
            <path
              d="M 64,178 Q 100,203 136,178"
              fill="none"
              stroke="url(#lapisGrad)"
              strokeWidth="4"
            />
            <path
              d="M 52,192 Q 100,218 148,192"
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>

      {/* Floating Status Indicator */}
      {isLoading && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border border-amber-200"></span>
        </span>
      )}
    </div>
  );
};
