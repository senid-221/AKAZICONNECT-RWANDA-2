import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface CompanyLogoProps {
  company: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  customLogoUrl?: string;
}

interface LogoConfig {
  src: string;
  bgColor?: string;
  alt: string;
}

// Exact official logo mapping for Rwandan employers
const OFFICIAL_LOGOS: Record<string, LogoConfig> = {
  rwandair: {
    src: '/logos/rwandair.svg',
    bgColor: 'bg-white',
    alt: 'RwandAir Official Logo',
  },
  fawe: {
    src: '/logos/fawe.png',
    bgColor: 'bg-white',
    alt: 'FAWE Rwanda Chapter Official Logo',
  },
  harmony: {
    src: '/logos/harmony.jpg',
    bgColor: 'bg-white',
    alt: 'Harmony Support BPO Ltd Official Logo',
  },
  'dp world': {
    src: '/logos/dp-world.svg',
    bgColor: 'bg-white',
    alt: 'DP World Logistics Rwanda Official Logo',
  },
  'one acre fund': {
    src: '/logos/one-acre-fund.jpg',
    bgColor: 'bg-white',
    alt: 'One Acre Fund Official Logo',
  },
  'u.s. embassy': {
    src: '/logos/us-embassy.svg',
    bgColor: 'bg-white',
    alt: 'U.S. Embassy Kigali Official Seal',
  },
  'us embassy': {
    src: '/logos/us-embassy.svg',
    bgColor: 'bg-white',
    alt: 'U.S. Embassy Kigali Official Seal',
  },
  lfl: {
    src: '/logos/lfl.png',
    bgColor: 'bg-white',
    alt: 'LFL Rwanda Ltd Official Logo',
  },
  rssb: {
    src: '/logos/rssb.svg',
    bgColor: 'bg-[#004e85]',
    alt: 'Rwanda Social Security Board (RSSB) Official Logo',
  },
  capitalist: {
    src: '/logos/capitalist.png',
    bgColor: 'bg-white',
    alt: 'Capitalist Supply & Logistics Ltd Official Logo',
  },
  hrms: {
    src: '/logos/hrms.png',
    bgColor: 'bg-white',
    alt: 'HR Management Services Ltd (HRMS Ltd) Official Logo',
  },
  'hope haven': {
    src: '/logos/hope-haven.png',
    bgColor: 'bg-white',
    alt: 'Hope Haven Christian School Official Logo',
  },
  fh: {
    src: '/logos/fh.png',
    bgColor: 'bg-white',
    alt: 'FH Association Rwanda (Food for the Hungry) Official Logo',
  },
  'ratwa sacco': {
    src: '/logos/ratwa-sacco.jpg',
    bgColor: 'bg-white',
    alt: 'RATWA SACCO HUYE Official Logo',
  },
  sacco: {
    src: '/logos/ratwa-sacco.jpg',
    bgColor: 'bg-white',
    alt: 'RATWA SACCO HUYE Official Logo',
  },
  'legal aid': {
    src: '/logos/laf.png',
    bgColor: 'bg-white',
    alt: 'Legal Aid Forum (LAF) Official Logo',
  },
  laf: {
    src: '/logos/laf.png',
    bgColor: 'bg-white',
    alt: 'Legal Aid Forum (LAF) Official Logo',
  },
  luna: {
    src: '/logos/luna-smelter.png',
    bgColor: 'bg-[#1e293b]',
    alt: 'LuNa Smelter Ltd Official Logo',
  },
  smelter: {
    src: '/logos/luna-smelter.png',
    bgColor: 'bg-[#1e293b]',
    alt: 'LuNa Smelter Ltd Official Logo',
  },
  wicloud: {
    src: '/logos/wicloud.jpg',
    bgColor: 'bg-white',
    alt: 'Wicloud Official Logo',
  },
  'bank of kigali': {
    src: '/logos/bank-of-kigali.svg',
    bgColor: 'bg-white',
    alt: 'Bank of Kigali Official Logo',
  },
  bk: {
    src: '/logos/bank-of-kigali.svg',
    bgColor: 'bg-white',
    alt: 'Bank of Kigali Official Logo',
  },
  mtn: {
    src: '/logos/mtn-logo.svg',
    bgColor: 'bg-[#FFCC00]',
    alt: 'MTN Rwanda Official Logo',
  },
  airtel: {
    src: '/logos/airtel-money.svg',
    bgColor: 'bg-white',
    alt: 'Airtel Rwanda Official Logo',
  },
};

function getLogoConfig(company: string): LogoConfig | null {
  const c = company.toLowerCase().trim();
  for (const [key, config] of Object.entries(OFFICIAL_LOGOS)) {
    if (c.includes(key)) {
      return config;
    }
  }
  return null;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  size = 'md',
  className = '',
  customLogoUrl,
}) => {
  const { branding } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  const sizeMap = {
    sm: 'w-8 h-8 rounded-lg p-1',
    md: 'w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-1.5',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2.5',
  };

  // Check admin uploaded custom branding first
  const companyKey = company.toLowerCase().trim();
  const dynamicLogo =
    customLogoUrl ||
    (branding?.companyLogos &&
      Object.keys(branding.companyLogos).find((k) => companyKey.includes(k.toLowerCase())) &&
      branding.companyLogos[
        Object.keys(branding.companyLogos).find((k) => companyKey.includes(k.toLowerCase()))!
      ]);

  if (dynamicLogo && !imageFailed) {
    return (
      <div
        className={`${sizeMap[size]} shrink-0 bg-white border border-[#e4e5d9] shadow-2xs flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={company}
      >
        <img
          src={dynamicLogo}
          alt={`${company} Official Logo`}
          loading="lazy"
          className="w-full h-full object-contain select-none"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  const logoConfig = getLogoConfig(company);

  if (logoConfig && !imageFailed) {
    return (
      <div
        className={`${sizeMap[size]} shrink-0 ${logoConfig.bgColor || 'bg-white'} border border-[#e4e5d9] shadow-2xs flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={logoConfig.alt}
      >
        <img
          src={logoConfig.src}
          alt={logoConfig.alt}
          loading="lazy"
          className="w-full h-full object-contain select-none"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  // Graceful fallback with initials
  const initials = company
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${sizeMap[size]} shrink-0 bg-[#174332] text-[#fffdf7] font-black text-xs flex items-center justify-center border border-[#102e24] shadow-2xs ${className}`}
      title={company}
    >
      <span className="tracking-tight">{initials || 'RW'}</span>
    </div>
  );
};
