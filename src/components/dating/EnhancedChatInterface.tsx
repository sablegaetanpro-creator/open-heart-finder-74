import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface EnhancedChatInterfaceProps {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    age: number;
  };
  onBack: () => void;
  onShowProfile?: () => void;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  matchId,
  otherUser,
  onBack,
  onShowProfile
}) => {
  return (
    <ChatContainer
      handleDragEnter={handleDragEnter}
      handleDragLeave={handleDragLeave}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
    >
      {/* Media Preview Modal */}
      <MediaPreviewModal
        previewMedia={previewMedia}
        uploadProgress={uploadProgress}
        isSending={isSending}
        onCancel={cancelMediaUpload}
        onConfirm={confirmMediaUpload}
      />

      {/* Header */}
      <ChatHeaderContent
        matchId={matchId}
        otherUser={otherUser}
        onBack={onBack}
        onShowProfile={onShowProfile}
        onReport={handleReport}
        onBlock={handleBlock}
      />

      {/* Messages */}
      <ChatMessages 
        messages={messages}
        renderMessage={renderMessage}
        messagesEndRef={messagesEndRef}
      />

      {/* Input Area */}
      <ChatInputSection
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleKeyPress={handleKeyPress}
        isSending={isSending}
        isRecording={isRecording}
        fileInputRef={fileInputRef}
        videoInputRef={videoInputRef}
        handleImageUpload={handleImageUpload}
        handleVideoUpload={handleVideoUpload}
        startRecording={startRecording}
        stopRecording={stopRecording}
        handleSendText={handleSendText}
        recordingDuration={recordingDuration}
        formatRecordingTime={formatRecordingTime}
        dragCounterRef={dragCounterRef}
      />
    </ChatContainer>
  );
};

export default EnhancedChatInterface;