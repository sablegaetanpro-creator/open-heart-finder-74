import { useEffect } from 'react';

interface BackButtonHandlerProps {
  onBackButton?: () => void;
  currentView?: string;
  onBackPress?: () => void;
}

const BackButtonHandler: React.FC<BackButtonHandlerProps> = ({ 
  onBackButton, 
  onBackPress,
  currentView 
}) => {
  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      if (onBackPress) {
        onBackPress();
      } else if (onBackButton) {
        onBackButton();
      }
    };

    // Add event listener for browser back button
    window.addEventListener('popstate', handleBackButton);

    // For mobile apps using Capacitor
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            if (onBackPress) {
              onBackPress();
            } else if (onBackButton) {
              onBackButton();
            } else {
              // Prevent app from closing, navigate to home instead
              window.history.pushState(null, '', '/');
            }
          }
        });
      }).catch(() => {
        // Capacitor not available, use fallback
        console.log('Capacitor not available');
      });
    }

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [onBackButton, onBackPress]);

  return null;
};

export default BackButtonHandler;