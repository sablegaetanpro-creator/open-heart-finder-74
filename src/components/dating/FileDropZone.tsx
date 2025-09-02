import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface FileDropZoneProps {
  isVisible: boolean;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-4 border-2 border-dashed border-primary rounded-lg bg-primary/5 flex items-center justify-center z-10">
      <div className="text-center">
        <FileImage className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="text-sm font-medium text-primary">Relâchez pour envoyer</p>
        <p className="text-xs text-muted-foreground">Images et vidéos acceptées</p>
      </div>
    </div>
  );
};

export default FileDropZone;