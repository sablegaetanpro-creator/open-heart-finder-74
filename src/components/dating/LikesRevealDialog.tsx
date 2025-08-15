import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types/database';
import { toast } from '@/hooks/use-toast';

interface LikesRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLikesUpdated: () => void;
}

interface LikerProfile extends Profile {
  is_revealed: boolean;
}

const LikesRevealDialog: React.FC<LikesRevealDialogProps> = ({ open, onOpenChange, onLikesUpdated }) => {
  const { user } = useAuth();
  const [likers, setLikers] = useState<LikerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadLikers();
    }
  }, [open, user]);

  const loadLikers = async () => {
    if (!user) return;

    try {
      // Get all users who liked me
      const { data: likesData, error: likesError } = await supabase
        .from('swipes')
        .select(`
          swiper_id,
          profiles!swipes_swiper_id_fkey(*)
        `)
        .eq('swiped_id', user.id)
        .eq('is_like', true);

      if (likesError) throw likesError;

      // Get revealed likes
      const { data: revealedData, error: revealedError } = await supabase
        .from('likes_revealed')
        .select('liker_id')
        .eq('user_id', user.id);

      if (revealedError) throw revealedError;

      const revealedIds = revealedData?.map(r => r.liker_id) || [];

      const likersWithRevealStatus: LikerProfile[] = (likesData || []).map(like => ({
        ...like.profiles as Profile,
        is_revealed: revealedIds.includes(like.swiper_id)
      }));

      setLikers(likersWithRevealStatus);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les likes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealByAd = async (likerId: string) => {
    if (!user) return;

    try {
      // Simulate watching an ad (in real app, integrate with AdMob)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record the reveal
      const { error } = await supabase
        .from('likes_revealed')
        .insert({
          user_id: user.id,
          liker_id: likerId,
          revealed_by: 'ad_view'
        });

      if (error) throw error;

      // Update local state
      setLikers(prev => prev.map(liker => 
        liker.user_id === likerId 
          ? { ...liker, is_revealed: true }
          : liker
      ));

      onLikesUpdated();

      toast({
        title: "Révélé !",
        description: "Vous pouvez maintenant voir qui vous a liké"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de révéler ce like",
        variant: "destructive"
      });
    }
  };

  const handleLikeBack = async (likerId: string) => {
    if (!user) return;

    try {
      // Create a like back (this will trigger match creation)
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: likerId,
          is_like: true
        });

      if (error) throw error;

      toast({
        title: "🎉 C'est un match !",
        description: "Vous pouvez maintenant vous envoyer des messages"
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de liker en retour",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-primary" />
            <span>Personnes qui vous ont liké</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : likers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun like pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {likers.map((liker) => (
              <Card key={liker.user_id} className="p-4">
                {liker.is_revealed ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={liker.profile_photo_url} alt={liker.first_name} />
                      <AvatarFallback>{liker.first_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{liker.first_name}, {liker.age}</h3>
                      <p className="text-sm text-muted-foreground">
                        {liker.relationship_type.replace('_', ' ')}
                      </p>
                      {liker.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {liker.bio}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleLikeBack(liker.user_id)}
                      className="bg-gradient-love text-white"
                      size="sm"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="relative w-16 h-16">
                      <Avatar className="w-full h-full blur-sm">
                        <AvatarImage src={liker.profile_photo_url} alt="Profile" />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Profil masqué</h3>
                      <p className="text-sm text-muted-foreground">
                        Regardez une pub pour révéler
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRevealByAd(liker.user_id)}
                      variant="outline"
                      size="sm"
                      className="border-2"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Pub
                    </Button>
                  </div>
                )}
              </Card>
            ))}
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Version Premium</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Voyez tous vos likes sans publicité + boostez votre profil !
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Découvrir Premium
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LikesRevealDialog;