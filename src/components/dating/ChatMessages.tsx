import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface ChatMessagesProps {
  messages: any[];
  renderMessage: (message: any) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  renderMessage,
  messagesEndRef
}) => {
  return (
    <ScrollArea className="flex-1 px-4 py-4">
      <div className="space-y-1">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;