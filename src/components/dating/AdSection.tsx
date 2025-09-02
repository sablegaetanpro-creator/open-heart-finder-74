import React from 'react';
import AdBanner from '../monetization/AdBanner';

interface AdSectionProps {
  isOnline: boolean;
}

const AdSection: React.FC<AdSectionProps> = ({ isOnline }) => {
  if (!isOnline) return null;

  return (
    <AdBanner 
      adUnitId="ca-app-pub-3940256099942544/6300978111" 
      className="mx-4 mt-2 relative z-10"
    />
  );
};

export default AdSection;