import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessagesListProps {
  messages: any[];
  renderMessage: (message: any) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessagesList: React.FC<MessagesListProps> = ({ 
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

export default MessagesList;