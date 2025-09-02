import React from 'react';
import { Input } from '@/components/ui/input';
import { RecordingIndicator } from './RecordingIndicator';
import { MediaButtons } from './MediaButtons';
import { EmojiButton } from './EmojiButton';
import { SendMessageButton } from './SendMessageButton';
import { DropZone } from './DropZone';

interface ChatInputAreaProps {
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

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
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
      <RecordingIndicator 
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        formatRecordingTime={formatRecordingTime}
      />

      <div className="flex items-end space-x-2">
        {/* Media buttons */}
        <MediaButtons
          onImageClick={() => fileInputRef.current?.click()}
          onVideoClick={() => videoInputRef.current?.click()}
          isSending={isSending}
          isRecording={isRecording}
        />

        {/* Message input */}
        <div className="flex-1 relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            disabled={isSending}
            className="border-0 bg-muted focus-visible:ring-1 focus-visible:ring-primary pr-12"
          />
          <EmojiButton onClick={() => {}} isSending={isSending} />
        </div>

        {/* Send button */}
        <SendMessageButton 
          onClick={handleSendText}
          isSending={isSending}
        />
      </div>

      {/* Zone de drop pour les fichiers */}
      <DropZone isVisible={dragCounterRef.current > 0} />

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

export default ChatInputArea;