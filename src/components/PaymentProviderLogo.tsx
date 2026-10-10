import React from 'react';
import { PaymentProvider } from '../types';

interface PaymentProviderLogoProps {
  provider: PaymentProvider | 'MTN' | 'AIRTEL' | 'BK' | 'VISA' | 'MASTERCARD' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'badge';
  className?: string;
  showLabel?: boolean;
}

export const PaymentProviderLogo: React.FC<PaymentProviderLogoProps> = ({
  provider,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const normalized = (provider || '').toUpperCase();

  // Responsive dimensions per size
  const getHeight = () => {
    switch (size) {
      case 'xs':
        return 'h-5';
      case 'sm':
        return 'h-7';
      case 'badge':
        return 'h-8 sm:h-9';
      case 'lg':
        return 'h-11 sm:h-12';
      case 'md':
      default:
        return 'h-8';
    }
  };

  // 1. MTN Mobile Money (Official asset from momo.mtn.com)
  if (normalized.includes('MTN') || normalized.includes('MOMO')) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <img
          src="/logos/mtn-momo.png"
          alt="MTN MoMo Official Logo"
          className={`${getHeight()} w-auto object-contain rounded-xl drop-shadow-xs`}
          onError={(e) => {
            // Fallback to SVG if PNG fails
            e.currentTarget.src = '/logos/mtn-momo.svg';
          }}
        />
        {showLabel && (
          <span className="text-xs font-bold text-[#173b2d]">MTN Mobile Money Rwanda</span>
        )}
      </div>
    );
  }

  // 2. Airtel Money Rwanda (Official Airtel branding)
  if (normalized.includes('AIRTEL')) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <img
          src="/logos/airtel-money.svg"
          alt="Airtel Money Rwanda Official Logo"
          className={`${getHeight()} w-auto object-contain rounded-lg drop-shadow-xs`}
          onError={(e) => {
            e.currentTarget.src = '/logos/airtel-logo.svg';
          }}
        />
        {showLabel && (
          <span className="text-xs font-bold text-[#173b2d]">Airtel Money Rwanda</span>
        )}
      </div>
    );
  }

  // 3. Bank of Kigali (Official SVG directly from cms.bkgroup.rw)
  if (normalized.includes('BANK') || normalized.includes('BK')) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <img
          src="/logos/bank-of-kigali.svg"
          alt="Bank of Kigali Official Logo"
          className={`${getHeight()} w-auto object-contain py-0.5 px-1 bg-white rounded-lg border border-[#e4e5d9] drop-shadow-2xs`}
        />
        {showLabel && (
          <span className="text-xs font-bold text-[#173b2d]">Bank of Kigali (BK)</span>
        )}
      </div>
    );
  }

  // 4. Visa & Mastercard (Official Visa and Mastercard vectors)
  if (normalized.includes('CARD') || normalized.includes('VISA') || normalized.includes('MASTER')) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <img
          src="/logos/cards.svg"
          alt="Visa & Mastercard Official Logos"
          className={`${getHeight()} w-auto object-contain rounded-lg drop-shadow-xs`}
        />
        {showLabel && (
          <span className="text-xs font-bold text-[#173b2d]">Visa & Mastercard Cards</span>
        )}
      </div>
    );
  }

  // Generic fallback
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 uppercase">
        {provider}
      </span>
    </div>
  );
};
