import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Eye } from 'lucide-react';
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

const ReceivedLikesView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState<LikeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);

  useEffect(() => {
    if (user) {
      loadReceivedLikes();
    }
  }, [user]);

  const loadReceivedLikes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('swipes')
        .select(`
          *,
          swiper_profile:profiles!swipes_swiper_id_fkey(*)
        `)
        .eq('swiped_id', user.id)
        .eq('is_like', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedLikes = (data || []).map(like => ({
        id: like.id,
        swiper_id: like.swiper_id,
        swiped_id: like.swiped_id,
        created_at: like.created_at,
        profile: {
          id: like.swiper_profile.id,
          user_id: like.swiper_profile.user_id,
          first_name: like.swiper_profile.first_name,
          profile_photo_url: like.swiper_profile.profile_photo_url,
          age: like.swiper_profile.age
        }
      }));

      setLikes(processedLikes);
    } catch (error) {
      console.error('Error loading received likes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les likes reçus",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (profileUserId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', user.id)
        .eq('swiped_id', profileUserId)
        .maybeSingle();

      if (existingSwipe) {
        toast({
          title: "Déjà liké",
          description: "Vous avez déjà liké cette personne"
        });
        return;
      }

      // Create new like
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: profileUserId,
          is_like: true
        });

      if (error) throw error;

      toast({
        title: "Like envoyé",
        description: "Votre like a été envoyé !"
      });

      // Refresh likes to see if there's a new match
      loadReceivedLikes();
    } catch (error) {
      console.error('Error liking back:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le like",
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
                        {like.profile.age} ans • Vous a liké
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
                        variant="default"
                        onClick={() => handleLikeBack(like.profile.user_id)}
                        className="bg-gradient-love hover:opacity-90"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Liker
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
                <h3 className="text-lg font-semibold mb-2">Aucun like reçu</h3>
                <p className="text-muted-foreground">
                  Personne ne vous a encore liké. Continuez à optimiser votre profil !
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Profile Detail View */}
      <ProfileDetailView
        profile={selectedProfile}
        open={showProfileDetail}
        onOpenChange={setShowProfileDetail}
        onLike={(profileUserId) => handleLikeBack(profileUserId)}
        showLikeButton={true}
      />
    </div>
  );
};

export default ReceivedLikesView;