import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    googletag: any;
    adsbygoogle: any;
  }
}

interface AdBannerProps {
  adUnitId: string;
  className?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  adUnitId, 
  className, 
  width = 320, 
  height = 50, 
  responsive = true 
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adRef.current) return;

    const loadAd = () => {
      try {
        // Check if AdMob/AdSense is available
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          // Google AdSense implementation
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsLoaded(true);
        } else {
          // Fallback to demo ad
          loadDemoAd();
        }
      } catch (err) {
        console.error('Error loading ad:', err);
        setError('Failed to load ad');
        loadDemoAd();
      }
    };

    const loadDemoAd = () => {
      if (adRef.current) {
        adRef.current.innerHTML = `
          <div class="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 text-center border border-border/20">
            <div class="text-xs text-muted-foreground mb-2">Publicité</div>
            <div class="text-sm font-medium text-foreground">
              🎉 Découvrez notre Premium !
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              Plus de matches, moins de publicités
            </div>
          </div>
        `;
        setIsLoaded(true);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);

    return () => clearTimeout(timer);
  }, [adUnitId]);

  if (error) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={adRef}
        className={cn(
          "block",
          !isLoaded && "animate-pulse bg-muted rounded-lg",
          responsive ? "w-full" : ""
        )}
        style={!responsive ? { width, height } : undefined}
      >
        {/* AdSense ad code */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3940256099942544"
          data-ad-slot={adUnitId.split('/').pop()}
          data-ad-format={responsive ? "auto" : ""}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
};

export default AdBanner;