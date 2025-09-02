import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Clock } from 'lucide-react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  recordingDuration: number;
  formatRecordingTime: (seconds: number) => string;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isRecording,
  recordingDuration,
  formatRecordingTime
}) => {
  if (!isRecording) return null;

  return (
    <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-red-700 dark:text-red-300">Enregistrement...</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-red-600" />
        <span className="text-sm font-mono text-red-700 dark:text-red-300">
          {formatRecordingTime(recordingDuration)}
        </span>
      </div>
    </div>
  );
};

export default RecordingIndicator;