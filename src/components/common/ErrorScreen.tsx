import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Heart } from 'lucide-react';

interface ErrorScreenProps {
  type?: 'network' | 'server' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  showRetry = true
}) => {
  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-16 h-16 text-muted-foreground" />,
          title: title || "Problème de connexion",
          message: message || "Vérifiez votre connexion internet et réessayez."
        };
      case 'server':
        return {
          icon: <Heart className="w-16 h-16 text-primary" />,
          title: title || "Service temporairement indisponible",
          message: message || "Vérifiez votre connexion internet ou l'application est indisponible pour le moment."
        };
      default:
        return {
          icon: <Heart className="w-16 h-16 text-primary" />,
          title: title || "Une erreur s'est produite",
          message: message || "Quelque chose s'est mal passé. Veuillez réessayer."
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center">
            {errorContent.icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground">
            {errorContent.title}
          </h2>

          {/* Message */}
          <p className="text-muted-foreground leading-relaxed">
            {errorContent.message}
          </p>

          {/* Retry Button */}
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              className="w-full bg-gradient-primary text-white hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          )}

          {/* App branding */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4 text-primary" fill="currentColor" />
            <span>LoveConnect</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorScreen;