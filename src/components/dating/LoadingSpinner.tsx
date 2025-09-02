import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface LoadingSpinnerProps {
  isLoading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingSpinner;