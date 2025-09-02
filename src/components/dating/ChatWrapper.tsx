import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface ChatWrapperProps {
  children: React.ReactNode;
}

const ChatWrapper: React.FC<ChatWrapperProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex" style={{ height: '100dvh' }}>
      {children}
    </div>
  );
};

export default ChatWrapper;