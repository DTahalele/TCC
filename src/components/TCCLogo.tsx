import React from 'react';

interface TCCLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'emblem';
  inverted?: boolean;
}

export const TCCLogo: React.FC<TCCLogoProps> = ({
  className = 'w-10 h-10',
  size,
  variant = 'full',
  inverted = false,
}) => {
  const primaryColor = inverted ? '#FFFFFF' : 'currentColor';
  const redColor = '#E52336';

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The Core Chamber Logo"
    >
      {/* 1. Outer Hexagonal Chamber Bracket */}
      <path
        fill={primaryColor}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 390 55 L 130 55 L 15 250 L 130 445 L 390 445 L 358 413 L 148 413 L 52 250 L 148 87 L 358 87 Z"
      />

      {/* 2. Inner Hexagonal Chamber Bracket */}
      <path
        fill={primaryColor}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 410 120 L 165 120 L 88 250 L 165 380 L 410 380 L 426 348 L 182 348 L 125 250 L 182 152 L 426 152 Z"
      />

      {/* 3. Right Chevron Bracket */}
      <path
        fill={primaryColor}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 410 180 L 480 250 L 410 320 L 448 320 L 480 288 L 480 212 L 448 180 Z"
      />

      {/* 4. Center Typography: THE CORE CHAMBER */}
      {variant === 'full' && (
        <g style={{ fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
          {/* "THE" */}
          <text
            x="175"
            y="236"
            fontSize="34"
            letterSpacing="8"
            fill={primaryColor}
            fontWeight="800"
          >
            THE
          </text>

          {/* "CORE" in Vivid Crimson Red */}
          <text
            x="276"
            y="236"
            fontSize="34"
            letterSpacing="8"
            fill={redColor}
            fontWeight="900"
          >
            CORE
          </text>

          {/* "CHAMBER" */}
          <text
            x="175"
            y="286"
            fontSize="32"
            letterSpacing="11"
            fill={primaryColor}
            fontWeight="800"
          >
            CHAMBER
          </text>
        </g>
      )}
    </svg>
  );
};
