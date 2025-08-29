import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  enableLazyLoad?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImageLoader: React.FC<OptimizedImageLoaderProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder-profile.jpg',
  enableLazyLoad = true,
  aspectRatio = 'portrait',
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!enableLazyLoad);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!enableLazyLoad) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enableLazyLoad]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
      default:
        return 'aspect-[4/5]';
    }
  };

  return (
    <div ref={imgRef} className={`relative ${getAspectRatioClass()} ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Image */}
      {isInView && (
        <img
          src={hasError ? fallbackSrc : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={enableLazyLoad ? 'lazy' : 'eager'}
        />
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">📷</div>
            <p className="text-xs">Image indisponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImageLoader;