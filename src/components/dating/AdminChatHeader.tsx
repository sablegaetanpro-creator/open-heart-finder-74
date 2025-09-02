import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface AdminChatHeaderProps {
  onBack: () => void;
}

const AdminChatHeader: React.FC<AdminChatHeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <Bot className="w-5 h-5" />
      </Button>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Assistant HeartSync</h3>
          <p className="text-xs text-muted-foreground">En ligne</p>
        </div>
      </div>
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
};

export default AdminChatHeader;