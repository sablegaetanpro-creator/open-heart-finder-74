import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface ChatInputSectionProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isSending: boolean;
  isRecording: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  videoInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startRecording: () => void;
  stopRecording: () => void;
  handleSendText: () => void;
  recordingDuration: number;
  formatRecordingTime: (seconds: number) => string;
  dragCounterRef: React.RefObject<number>;
}

const ChatInputSection: React.FC<ChatInputSectionProps> = ({
  newMessage,
  setNewMessage,
  handleKeyPress,
  isSending,
  isRecording,
  fileInputRef,
  videoInputRef,
  handleImageUpload,
  handleVideoUpload,
  startRecording,
  stopRecording,
  handleSendText,
  recordingDuration,
  formatRecordingTime,
  dragCounterRef
}) => {
  return (
    <div className="bg-card border-t border-border p-2 pb-2" style={{ paddingBottom: '8px' }}>
      {/* Recording indicator */}
      <RecordingTimer 
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        formatRecordingTime={formatRecordingTime}
      />

      <div className="flex items-end space-x-2">
        {/* Media buttons */}
        <MediaUploader
          onImageClick={() => fileInputRef.current?.click()}
          onVideoClick={() => videoInputRef.current?.click()}
          isSending={isSending}
          isRecording={isRecording}
        />

        {/* Message input */}
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleKeyPress={handleKeyPress}
          isSending={isSending}
        />

        {/* Send button */}
        <SendMessageButton 
          onClick={handleSendText}
          isSending={isSending}
        />
      </div>

      {/* Zone de drop pour les fichiers */}
      <DropOverlay isVisible={dragCounterRef.current > 0} />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ChatInputSection;