import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, X } from 'lucide-react';

interface LikesListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  likes: any[];
  title: string;
  emptyMessage: string;
}

const LikesListDialog: React.FC<LikesListDialogProps> = ({
  open,
  onOpenChange,
  likes,
  title,
  emptyMessage
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {likes.length === 0 ? (
              <p className="text-center text-muted-foreground">{emptyMessage}</p>
            ) : (
              likes.map((like) => (
                <div key={like.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={like.profile.profile_photo_url} />
                    <AvatarFallback>{like.profile.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{like.profile.first_name}</h3>
                    <p className="text-sm text-muted-foreground">{like.profile.age} ans</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LikesListDialog;