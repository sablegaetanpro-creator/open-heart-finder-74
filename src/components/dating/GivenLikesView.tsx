import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfileDetailView from './ProfileDetailView';

interface LikeWithProfile {
  id: string;
  swiper_id: string;
  swiped_id: string;
  created_at: string;
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    profile_photo_url: string;
    age: number;
  };
}

const GivenLikesView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState<LikeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [removeLikeId, setRemoveLikeId] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadGivenLikes();
    }
  }, [user]);

  const loadGivenLikes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('swipes')
        .select(`
          *,
          swiped_profile:profiles!swipes_swiped_id_fkey(*)
        `)
        .eq('swiper_id', user.id)
        .eq('is_like', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedLikes = (data || []).map(like => ({
        id: like.id,
        swiper_id: like.swiper_id,
        swiped_id: like.swiped_id,
        created_at: like.created_at,
        profile: {
          id: like.swiped_profile.id,
          user_id: like.swiped_profile.user_id,
          first_name: like.swiped_profile.first_name,
          profile_photo_url: like.swiped_profile.profile_photo_url,
          age: like.swiped_profile.age
        }
      }));

      setLikes(processedLikes);
    } catch (error) {
      console.error('Error loading given likes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les likes donnés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLike = async (likeId: string) => {
    try {
      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('id', likeId);

      if (error) throw error;

      setLikes(prev => prev.filter(like => like.id !== likeId));
      setShowRemoveDialog(false);
      setRemoveLikeId(null);
      
      toast({
        title: "Like retiré",
        description: "Le like a été retiré avec succès"
      });
    } catch (error) {
      console.error('Error removing like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le like. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const openProfileDetail = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSelectedProfile(data);
        setShowProfileDetail(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {likes.length > 0 ? (
            likes.map((like) => (
              <Card key={like.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={like.profile.profile_photo_url} />
                        <AvatarFallback>{like.profile.first_name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate">
                          {like.profile.first_name}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(like.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {like.profile.age} ans • Vous l'avez liké
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openProfileDetail(like.profile.user_id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Profil
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setRemoveLikeId(like.id);
                          setShowRemoveDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Retirer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun like donné</h3>
                <p className="text-muted-foreground">
                  Vous n'avez encore liké personne. Allez découvrir des profils !
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Remove Like Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer le like</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir retirer ce like ? Cette action est irréversible.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowRemoveDialog(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => removeLikeId && handleRemoveLike(removeLikeId)}
                className="flex-1"
              >
                Retirer le like
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Detail View */}
      <ProfileDetailView
        profile={selectedProfile}
        open={showProfileDetail}
        onOpenChange={setShowProfileDetail}
        showLikeButton={false}
      />
    </div>
  );
};

export default GivenLikesView;