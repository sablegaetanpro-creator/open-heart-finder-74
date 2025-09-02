import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MatchProfileCardProps {
  match: any;
  onMatchClick: () => void;
}

const MatchProfileCard: React.FC<MatchProfileCardProps> = ({ match, onMatchClick }) => {
  return (
    <Card 
      className=\"cursor-pointer hover:shadow-md transition-shadow\"
      onClick={onMatchClick}
    >
      <div className=\"p-4\">
        <div className=\"flex items-center space-x-3\">
          <div className=\"relative\">
            <img 
              src={match.profile.profile_photo_url} 
              alt={match.profile.first_name}
              className=\"w-12 h-12 rounded-full object-cover\"
            />
            {match.unreadCount > 0 && (
              <Badge className=\"absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs\">
                {match.unreadCount}
              </Badge>
            )}
          </div>
          <div className=\"flex-1 min-w-0\">
            <div className=\"flex items-center justify-between\">
              <h3 className=\"font-semibold text-foreground truncate\">
                {match.profile.first_name}
              </h3>
              {match.lastMessage && (
                <span className=\"text-xs text-muted-foreground flex-shrink-0\">
                  {formatTime(match.lastMessage.created_at)}
                </span>
              )}
            </div>
            <p className=\"text-sm text-muted-foreground truncate\">
              {formatLastMessage(match.lastMessage)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Utility functions (move to separate file if used elsewhere)
const formatLastMessage = (message: any) => {
  if (!message) return 'Commencez la conversation...';
  
  const isOwn = message.sender_id === localStorage.getItem('user_id'); // Adapt with context
  const prefix = isOwn ? 'Vous: ' : '';
  return `${prefix}${message.content}`;
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'À l\\'instant';
  } else if (diffInHours < 24) {
    return `Il y a ${Math.floor(diffInHours)}h`;
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
};

export default MatchProfileCard;