import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface AudioRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  isSending: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onTouchStart,
  onTouchEnd,
  isSending
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`text-muted-foreground hover:text-foreground hover:bg-accent ${
        isRecording && "text-red-500 bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
      }`}
      onMouseDown={onStartRecording}
      onMouseUp={onStopRecording}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      disabled={isSending}
      title="Maintenir pour enregistrer un audio"
    >
      <Mic className="w-5 h-5" />
    </Button>
  );
};

export default AudioRecorder;