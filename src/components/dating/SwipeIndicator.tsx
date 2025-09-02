import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, Zap } from 'lucide-react';

interface SwipeIndicatorProps {
  swipeDirection: 'left' | 'right' | null;
  swipeDistance: number;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ swipeDirection, swipeDistance }) => {
  if (!swipeDirection || swipeDistance <= 50) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
      <div className={`text-6xl font-bold ${swipeDirection === 'right' ? 'text-green-500' : 'text-red-500'}`}>
        {swipeDirection === 'right' ? '❤️' : '✖️'}
      </div>
    </div>
  );
};

export default SwipeIndicator;