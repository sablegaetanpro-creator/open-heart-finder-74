import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Briefcase, 
  Heart, 
  Camera, 
  Edit,
  MessageCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfileEditor from './ProfileEditor';

interface Like {
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

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    profile_photo_url: string;
    age: number;
  };
}

interface SimplifiedProfileViewProps {
  onNavigateToSettings?: () => void;
}

const SimplifiedProfileView: React.FC<SimplifiedProfileViewProps> = ({ onNavigateToSettings }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([]);
  const [givenLikes, setGivenLikes] = useState<Like[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([
      loadReceivedLikes(),
      loadGivenLikes(),
      loadMatches()
    ]);
  };

  const loadReceivedLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('swipes')
        .select(`
          *,
          swiper_profile:profiles!swipes_swiper_id_fkey(*)
        `)
        .eq('swiped_id', user.id)
        .eq('is_like', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error for received likes:', error);
        return;
      }

      const processedLikes = (data || []).map(like => ({
        id: like.id,
        swiper_id: like.swiper_id,
        swiped_id: like.swiped_id,
        created_at: like.created_at,
        profile: {
          id: like.swiper_profile?.id || '',
          user_id: like.swiper_profile?.user_id || '',
          first_name: like.swiper_profile?.first_name || 'Utilisateur',
          profile_photo_url: like.swiper_profile?.profile_photo_url || '',
          age: like.swiper_profile?.age || 25
        }
      }));

      setReceivedLikes(processedLikes);
    } catch (error) {
      console.error('Error loading received likes:', error);
    }
  };

  const loadGivenLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('swipes')
        .select(`
          *,
          swiped_profile:profiles!swipes_swiped_id_fkey(*)
        `)
        .eq('swiper_id', user.id)
        .eq('is_like', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error for given likes:', error);
        return;
      }

      console.log('Given likes raw data:', data);

      const processedLikes = (data || []).filter(like => like.swiped_profile).map(like => ({
        id: like.id,
        swiper_id: like.swiper_id,
        swiped_id: like.swiped_id,
        created_at: like.created_at,
        profile: {
          id: like.swiped_profile?.id || '',
          user_id: like.swiped_profile?.user_id || '',
          first_name: like.swiped_profile?.first_name || 'Utilisateur',
          profile_photo_url: like.swiped_profile?.profile_photo_url || '',
          age: like.swiped_profile?.age || 25
        }
      }));

      console.log('Processed given likes:', processedLikes);
      setGivenLikes(processedLikes);
    } catch (error) {
      console.error('Error loading given likes:', error);
    }
  };

  const loadMatches = async () => {
    if (!user) return;

    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1_profile:profiles!matches_user1_id_fkey(*),
          user2_profile:profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedMatches = (matchesData || []).map((match) => {
        const otherProfile = match.user1_id === user.id ? match.user2_profile : match.user1_profile;

        return {
          ...match,
          profile: {
            id: otherProfile.id,
            user_id: otherProfile.user_id,
            first_name: otherProfile.first_name,
            profile_photo_url: otherProfile.profile_photo_url,
            age: otherProfile.age
          }
        };
      });

      setMatches(processedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const handleLikeBack = async (likerId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: likerId,
          is_like: true
        });

      if (error) throw error;

      toast({
        title: "Like envoyé !",
        description: "Vous avez liké cette personne en retour"
      });
      
      loadData();
    } catch (error) {
      console.error('Error liking back:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le like",
        variant: "destructive"
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Chargement du profil...</h2>
        </div>
      </div>
    );
  }

  const displayPhotos = profile.additional_photos || [];
  const allPhotos = profile.profile_photo_url 
    ? [profile.profile_photo_url, ...displayPhotos].slice(0, 6)
    : displayPhotos.slice(0, 6);

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-hero"></div>
        
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background shadow-love">
              <AvatarImage src={profile.profile_photo_url} alt={profile.first_name} />
              <AvatarFallback className="text-2xl">{profile.first_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
              onClick={() => setShowProfileEditor(true)}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {profile.first_name}, {profile.age}
          </h1>
          <div className="flex items-center justify-center text-muted-foreground mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Paris, France</span>
          </div>
          {profile.profession && (
            <div className="flex items-center justify-center text-muted-foreground mt-1">
              <Briefcase className="w-4 h-4 mr-1" />
              <span>{profile.profession}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={() => setShowProfileEditor(true)} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Modifier le profil
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card 
            className="text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toast({ title: "Likes reçus", description: `${receivedLikes.length} personnes vous ont liké` })}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{receivedLikes.length}</div>
                <div className="text-sm text-muted-foreground">Likes reçus</div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              window.location.hash = '#messages';
              window.dispatchEvent(new CustomEvent('navigate-to-messages'));
            }}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                <div className="text-2xl font-bold text-message">{matches.length}</div>
                <div className="text-sm text-muted-foreground">Matches</div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toast({ title: "Likes donnés", description: `${givenLikes.length} likes envoyés` })}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <Eye className="w-6 h-6 text-primary" />
                <div className="text-2xl font-bold text-like">{givenLikes.length}</div>
                <div className="text-sm text-muted-foreground">Likes donnés</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                À propos de moi
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Mes centres d'intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Mes photos</h3>
            <div className="grid grid-cols-3 gap-3">
              {allPhotos.map((photo, index) => (
                <div key={index} className="aspect-square relative">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
              {allPhotos.length < 6 && (
                <div 
                  className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setShowProfileEditor(true)}
                >
                  <div className="text-center">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ajouter</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Editor Dialog */}
      {showProfileEditor && (
        <ProfileEditor
          open={showProfileEditor}
          onOpenChange={setShowProfileEditor}
        />
      )}
    </div>
  );
};

export default SimplifiedProfileView;