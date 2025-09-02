import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface LoadingMessagesProps {
  loading: boolean;
}

const LoadingMessages: React.FC<LoadingMessagesProps> = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingMessages;