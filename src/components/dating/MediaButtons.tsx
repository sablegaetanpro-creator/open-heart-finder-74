import React from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video } from 'lucide-react';

interface MediaButtonsProps {
  onImageClick: () => void;
  onVideoClick: () => void;
  isSending: boolean;
  isRecording: boolean;
}

const MediaButtons: React.FC<MediaButtonsProps> = ({
  onImageClick,
  onVideoClick,
  isSending,
  isRecording
}) => {
  return (
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground hover:bg-accent"
        onClick={onImageClick}
        disabled={isSending || isRecording}
        title="Envoyer une image"
      >
        <Image className="w-5 h-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground hover:bg-accent"
        onClick={onVideoClick}
        disabled={isSending || isRecording}
        title="Envoyer une vidéo"
      >
        <Video className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default MediaButtons;