import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import LikesRevealDialog from './LikesRevealDialog';
import { offlineDataManager } from '@/lib/offlineDataManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Briefcase, 
  Heart, 
  Camera, 
  Edit,
  Settings,
  Calendar,
  Eye,
  Lock,
  Play,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ProfileEditor from './ProfileEditor';
import ProfileDetailView from './ProfileDetailView';
import GivenLikesProfileView from './GivenLikesProfileView';

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
    bio?: string;
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

interface ProfileViewProps {
  onNavigateToSettings?: () => void;
  onViewGivenLikesProfile?: (profile: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSettings, onViewGivenLikesProfile }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([]);
  const [givenLikes, setGivenLikes] = useState<Like[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [showGivenLikesDialog, setShowGivenLikesDialog] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [hasRevealedLikes, setHasRevealedLikes] = useState(false);
  const [showBoostDialog, setShowBoostDialog] = useState(false);
  const [isProfileBoosted, setIsProfileBoosted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showGivenLikesProfile, setShowGivenLikesProfile] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
      checkBoostStatus();
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([
      loadReceivedLikes(),
      loadGivenLikes(),
      loadMatches(),
      checkRevealedLikes(),
      checkBoostStatus()
    ]);
  };

  const loadReceivedLikes = async () => {
    if (!user) return;

    try {
      // First try to get received likes from Supabase
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
          age: like.swiper_profile?.age || 25,
          bio: like.swiper_profile?.bio || ''
        }
      }));

      setReceivedLikes(processedLikes);
      
      // Pour débogage: afficher le nombre de likes reçus
      console.log(`Likes reçus chargés: ${processedLikes.length}`);
      
    } catch (error) {
      console.error('Error loading received likes:', error);
    }
  };

  const loadGivenLikes = async () => {
    if (!user) return;

    try {
      // First try to get likes from offline data
      const offlineLikes = await offlineDataManager.getUserLikes(user.id);
      
      if (offlineLikes.length > 0) {
        // Get profile data for the offline likes
        const likesWithProfiles = await Promise.all(
          offlineLikes.map(async (like) => {
            const profile = await offlineDataManager.getProfileByUserId(like.swiped_id);
            if (profile) {
              return {
                id: like.id,
                swiper_id: like.swiper_id,
                swiped_id: like.swiped_id,
                created_at: like.created_at,
                profile: {
                  id: profile.id,
                  user_id: profile.user_id,
                  first_name: profile.first_name,
                  profile_photo_url: profile.profile_photo_url,
                  age: profile.age,
                  bio: profile.bio
                }
              };
            }
            return null;
          })
        );
        
        const validLikes = likesWithProfiles.filter(like => like !== null);
        setGivenLikes(validLikes);
        
        // If we have offline data, return early
        if (validLikes.length > 0) return;
      }

      // Fallback to Supabase if no offline data
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
          age: like.swiped_profile.age,
          bio: like.swiped_profile.bio
        }
      }));

      setGivenLikes(processedLikes);
    } catch (error) {
      console.error('Error loading given likes:', error);
    }
  };

  const checkBoostStatus = async () => {
    if (!user) return;

    try {
      // Using any temporarily until types are updated
      const { data, error } = await (supabase as any)
        .from('profile_boosts')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!error && data) {
        setIsProfileBoosted(true);
      }
    } catch (error) {
      console.error('Error checking boost status:', error);
    }
  };

  const handleBoostProfile = () => {
    setShowBoostDialog(true);
  };

  const handleWatchAdForBoost = async () => {
    toast({
      title: "Publicité regardée !",
      description: "Votre profil est maintenant boosté pour 30 minutes"
    });

    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      // Using any temporarily until types are updated
      await (supabase as any)
        .from('profile_boosts')
        .insert({
          user_id: user?.id,
          boost_type: 'ad',
          expires_at: expiresAt.toISOString()
        });
      
      setIsProfileBoosted(true);
      setShowBoostDialog(false);
      
      // Recheck boost status after some time
      setTimeout(() => {
        checkBoostStatus();
      }, 30 * 60 * 1000); // 30 minutes
    } catch (error) {
      console.error('Error recording boost:', error);
    }
  };

  const handlePayForBoost = async () => {
    toast({
      title: "Paiement effectué !",
      description: "Votre profil est maintenant boosté pour 24 heures"
    });

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Using any temporarily until types are updated
      await (supabase as any)
        .from('profile_boosts')
        .insert({
          user_id: user?.id,
          boost_type: 'payment',
          expires_at: expiresAt.toISOString()
        });
      
      setIsProfileBoosted(true);
      setShowBoostDialog(false);
      
      // Recheck boost status after some time
      setTimeout(() => {
        checkBoostStatus();
      }, 24 * 60 * 60 * 1000); // 24 hours
    } catch (error) {
      console.error('Error recording boost:', error);
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

  const checkRevealedLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('likes_revealed')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Utiliser maybeSingle() au lieu de single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking revealed likes:', error);
        return;
      }

      setHasRevealedLikes(!!data);
    } catch (error) {
      console.error('Error checking revealed likes:', error);
    }
  };

  const handleRevealLikes = () => {
    if (hasRevealedLikes) {
      setShowLikesDialog(true);
    } else {
      setShowAdDialog(true);
    }
  };

  const handleWatchAd = async () => {
    toast({
      title: "Publicité regardée !",
      description: "Vous pouvez maintenant voir qui vous a liké"
    });

    try {
      await supabase
        .from('likes_revealed')
        .insert({
          user_id: user?.id,
          liker_id: receivedLikes[0]?.swiper_id || 'unknown',
          revealed_by: 'ad'
        });
      
      setHasRevealedLikes(true);
      setShowAdDialog(false);
      setShowLikesDialog(true);
    } catch (error) {
      console.error('Error recording revealed likes:', error);
    }
  };

  const handlePayToReveal = async () => {
    toast({
      title: "Paiement effectué !",
      description: "Vous pouvez maintenant voir qui vous a liké"
    });

    try {
      await supabase
        .from('likes_revealed')
        .insert({
          user_id: user?.id,
          liker_id: receivedLikes[0]?.swiper_id || 'unknown',
          revealed_by: 'payment'
        });
      
      setHasRevealedLikes(true);
      setShowAdDialog(false);
      setShowLikesDialog(true);
    } catch (error) {
      console.error('Error recording revealed likes:', error);
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
      
      // Recharger les données
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

        <div className="flex justify-center space-x-4 mb-8">
          <Button variant="love" className="flex-1 max-w-32" onClick={() => navigate('/profile-edit')}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button 
            variant={isProfileBoosted ? "default" : "outline"} 
            className="flex-1 max-w-32" 
            onClick={handleBoostProfile}
          >
            {isProfileBoosted ? (
              <>🚀 Boosté</>
            ) : (
              <>🚀 Boost</>
            )}
          </Button>
          <Button variant="outline" className="flex-1 max-w-32" onClick={onNavigateToSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Réglages
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card 
            className="text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleRevealLikes}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Heart className="w-6 h-6 text-primary" />
                  {!hasRevealedLikes && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />}
                </div>
                <div className="text-2xl font-bold text-primary">{receivedLikes.length}</div>
                <div className="text-sm text-muted-foreground">Likes reçus</div>
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
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
            onClick={() => setShowGivenLikesDialog(true)}
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
                  onClick={() => {
                    console.log('Ouvrir l\'éditeur de profil pour ajouter photo...');
                    setShowProfileEditor(true);
                  }}
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

      {/* Likes Received Dialog */}
      <Dialog open={showLikesDialog} onOpenChange={setShowLikesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Likes reçus ({receivedLikes.length})</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {receivedLikes.map((like) => (
                <div key={like.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={like.profile.profile_photo_url} />
                    <AvatarFallback>{like.profile.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{like.profile.first_name}, {like.profile.age}</h4>
                    {like.profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{like.profile.bio}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProfile(like.profile);
                        setShowProfileDetail(true);
                      }}
                    >
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleLikeBack(like.swiper_id)}
                      className="rounded-full"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Given Likes Dialog */}
      <Dialog open={showGivenLikesDialog} onOpenChange={setShowGivenLikesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Likes donnés ({givenLikes.length})</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {givenLikes.map((like) => (
                <div key={like.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={like.profile.profile_photo_url} />
                    <AvatarFallback>{like.profile.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{like.profile.first_name}, {like.profile.age}</h4>
                    {like.profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{like.profile.bio}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (onViewGivenLikesProfile) {
                        setShowGivenLikesDialog(false);
                        onViewGivenLikesProfile(like.profile);
                      } else {
                        setSelectedProfile(like.profile);
                        setShowProfileDetail(true);
                      }
                    }}
                  >
                    Voir profil
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Boost Dialog */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🚀 Booster votre profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Boostez votre profil pour être vu en priorité et recevoir plus de likes !
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Avantages du boost :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Profil affiché en priorité</li>
                  <li>• 10x plus de visibilité</li>
                  <li>• Plus de chances de match</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Button onClick={handleWatchAdForBoost} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Regarder une pub (30 min gratuit)
              </Button>
              <Button onClick={handlePayForBoost} variant="outline" className="w-full">
                Payer 1.99€ (24h de boost)
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              💚 Notre devise : Entièrement gratuit avec les pubs !
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Dialog */}
      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Voir qui vous a liké</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              {receivedLikes.length} personne{receivedLikes.length > 1 ? 's' : ''} vous {receivedLikes.length > 1 ? 'ont' : 'a'} liké !
            </p>
            <div className="flex flex-col space-y-3">
              <Button onClick={handleWatchAd} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Regarder une pub (Gratuit)
              </Button>
              <Button onClick={handlePayToReveal} variant="outline" className="w-full">
                Payer 0.99€ (Sans pub)
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
        onLike={handleLikeBack}
        showLikeButton={true}
      />
    </div>
  );
};

export default ProfileView;