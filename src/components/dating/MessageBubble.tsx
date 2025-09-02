import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  formatTime: (dateString: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn,
  formatTime
}) => {
  return (
    <div
      key={message.id}
      className={`flex w-full mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
        isOwn 
          ? "bg-gradient-love text-white ml-12" 
          : "bg-muted text-foreground mr-12"
      }`}>
        {message.media_type === 'image' && message.media_url && (
          <div className="mb-2">
            <img 
              src={message.media_url} 
              alt="Shared image" 
              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
              onClick={() => window.open(message.media_url, '_blank')}
              loading="lazy"
            />
          </div>
        )}
        
        {message.media_type === 'video' && message.media_url && (
          <div className="mb-2">
            <video 
              src={message.media_url} 
              controls 
              className="max-w-full rounded-lg"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
        
        {message.media_type === 'audio' && message.media_url && (
          <div className="mb-2">
            <audio 
              src={message.media_url} 
              controls 
              className="w-full"
            />
          </div>
        )}
        
        {message.content && (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}
        
        <div className={`text-xs mt-1 opacity-70 ${isOwn ? "text-right" : "text-left"}`}>
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;