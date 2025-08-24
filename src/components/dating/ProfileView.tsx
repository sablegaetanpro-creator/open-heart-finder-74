import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import LikesRevealDialog from './LikesRevealDialog';
import { offlineDataManager } from '@/lib/offlineDataManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  profile?: {
    id: string;
    user_id: string;
    first_name: string;
    profile_photo_url: string;
    age: number;
  };
}

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  profile_photo_url: string;
  additional_photos?: string[];
  bio?: string;
  profession?: string;
  interests?: string[];
  height?: number;
  education?: string;
  exercise_frequency?: string;
  children?: string;
  animals?: string;
  smoker?: boolean;
  drinks?: string;
}

const ProfileView: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [givenLikes, setGivenLikes] = useState<Like[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingGivenLikes, setLoadingGivenLikes] = useState(true);
  const [loadingReceivedLikes, setLoadingReceivedLikes] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [showGivenLikesProfile, setShowGivenLikesProfile] = useState<Profile | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showRevealDialog, setShowRevealDialog] = useState(false);
  const [revealedLikesCount, setRevealedLikesCount] = useState(0);

  const loadGivenLikes = useCallback(async () => {
    if (!user) {
      console.log('🚫 No user found, cannot load given likes');
      setGivenLikes([]);
      setLoadingGivenLikes(false);
      return;
    }
    
    setLoadingGivenLikes(true);
    console.log('🚀 Starting loadGivenLikes for user:', user.id);
    
    try {
      // First, get the swipes with better error handling
      const { data: swipesData, error: swipesError } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', user.id)
        .eq('is_like', true)
        .order('created_at', { ascending: false });

      console.log('📊 Given likes swipes data:', swipesData);

      if (swipesError) {
        console.error('❌ Error loading given likes swipes:', swipesError);
        throw swipesError;
      }

      if (!swipesData || swipesData.length === 0) {
        console.log('📭 No given likes found');
        setGivenLikes([]);
        return;
      }

      // Then get the profiles for these swipes using RPC to bypass RLS restrictions
      console.log('👥 Loading profiles for user IDs:', userIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .rpc('get_profiles_for_user_ids', { user_ids: userIds });

      console.log('👤 Profiles data for given likes (via RPC):', profilesData);

      if (profilesError) {
        console.error('❌ Error loading profiles for given likes:', profilesError);
        throw profilesError;
      }

      // Transform the data to match our interface
      const transformedLikes = swipesData.map((swipe: any) => {
        const profile = profilesData?.find(p => p.user_id === swipe.swiped_id);
        if (!profile) {
          console.warn('⚠️ No profile found for swiped_id:', swipe.swiped_id);
        }
        return {
          id: swipe.id,
          swiper_id: swipe.swiper_id,
          swiped_id: swipe.swiped_id,
          created_at: swipe.created_at,
          profile: profile || null
        };
      }).filter(like => like.profile !== null); // Only keep likes with valid profiles

      console.log('✅ Transformed given likes:', transformedLikes);
      setGivenLikes(transformedLikes);
      
    } catch (error: any) {
      console.error('❌ Error in loadGivenLikes:', error);
      
      // More specific error messages
      let errorMessage = "Impossible de charger les likes envoyés";
      if (error.code === 'PGRST116') {
        errorMessage = "Problème de connexion à la base de données";
      } else if (error.message?.includes('auth')) {
        errorMessage = "Problème d'authentification. Veuillez vous reconnecter.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Set empty array on error to show the "no likes" message
      setGivenLikes([]);
    } finally {
      setLoadingGivenLikes(false);
    }
  }, [user, toast]);

  const loadReceivedLikes = useCallback(async () => {
    if (!user) return;
    
    setLoadingReceivedLikes(true);
    try {
      // First, get the swipes
      const { data: swipesData, error: swipesError } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiped_id', user.id)
        .eq('is_like', true)
        .order('created_at', { ascending: false });

      console.log('💖 Received likes swipes data:', swipesData);
      console.log('❌ Received likes swipes error:', swipesError);

      if (swipesError) throw swipesError;

      if (!swipesData || swipesData.length === 0) {
        console.log('📭 No received likes found');
        setReceivedLikes([]);
        return;
      }

      // Then get the profiles for these swipes
      const userIds = swipesData.map(swipe => swipe.swiper_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      console.log('👤 Profiles data for received likes:', profilesData);
      console.log('❌ Profiles error:', profilesError);

      if (profilesError) throw profilesError;

      // Transform the data to match our interface
      const transformedLikes = swipesData.map((swipe: any) => {
        const profile = profilesData?.find(p => p.user_id === swipe.swiper_id);
        return {
          id: swipe.id,
          swiper_id: swipe.swiper_id,
          swiped_id: swipe.swiped_id,
          created_at: swipe.created_at,
          profile: profile || null
        };
      }).filter(like => like.profile !== null); // Only keep likes with valid profiles

      console.log('✅ Transformed received likes:', transformedLikes);
      setReceivedLikes(transformedLikes);
    } catch (error: any) {
      console.error('Error loading received likes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les likes reçus",
        variant: "destructive"
      });
    } finally {
      setLoadingReceivedLikes(false);
    }
  }, [user, toast]);

  const loadMatches = useCallback(async () => {
    if (!user) return;
    
    setLoadingMatches(true);
    try {
      // First, get the matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('💕 Matches data:', matchesData);
      console.log('❌ Matches error:', matchesError);

      if (matchesError) throw matchesError;

      if (!matchesData || matchesData.length === 0) {
        console.log('📭 No matches found');
        setMatches([]);
        return;
      }

      // Get all user IDs involved in matches (excluding current user)
      const userIds = matchesData.map(match => 
        match.user1_id === user.id ? match.user2_id : match.user1_id
      );

      // Then get the profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      console.log('👤 Profiles data for matches:', profilesData);
      console.log('❌ Profiles error:', profilesError);

      if (profilesError) throw profilesError;

      // Enrich matches with profile data
      const enrichedMatches = matchesData.map(match => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const otherUserProfile = profilesData?.find(p => p.user_id === otherUserId);
        
        return {
          ...match,
          profile: otherUserProfile // Simplified for UI compatibility
        };
      }).filter(match => match.profile); // Only keep matches with valid profiles

      console.log('✅ Enriched matches:', enrichedMatches);
      setMatches(enrichedMatches);
    } catch (error: any) {
      console.error('Error loading matches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matches",
        variant: "destructive"
      });
    } finally {
      setLoadingMatches(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      Promise.all([
        loadGivenLikes(),
        loadReceivedLikes(),
        loadMatches()
      ]);
    }
  }, [user, loadGivenLikes, loadReceivedLikes, loadMatches]);

  const handleGivenLikeClick = (like: Like) => {
    const profileData: Profile = {
      id: like.profile.id,
      user_id: like.profile.user_id,
      first_name: like.profile.first_name,
      age: like.profile.age,
      profile_photo_url: like.profile.profile_photo_url,
      additional_photos: (like.profile as any).additional_photos,
      bio: like.profile.bio,
      profession: (like.profile as any).profession,
      interests: (like.profile as any).interests,
      height: (like.profile as any).height,
      education: (like.profile as any).education,
      exercise_frequency: (like.profile as any).exercise_frequency,
      children: (like.profile as any).children,
      animals: (like.profile as any).animals,
      smoker: (like.profile as any).smoker,
      drinks: (like.profile as any).drinks
    };
    setShowGivenLikesProfile(profileData);
  };

  const handleReceivedLikeClick = (like: Like) => {
    const profileData: Profile = {
      id: like.profile.id,
      user_id: like.profile.user_id,
      first_name: like.profile.first_name,
      age: like.profile.age,
      profile_photo_url: like.profile.profile_photo_url,
      bio: like.profile.bio
    };
    setSelectedProfile(profileData);
    setShowProfileDetail(true);
  };

  const handleMatchClick = (match: Match) => {
    navigate(`/chat/${match.id}`);
  };

  const handleRemoveLike = useCallback((profileId: string) => {
    setGivenLikes(prev => prev.filter(like => like.profile.user_id !== profileId));
  }, []);

  const handleLikeBack = async (userId: string) => {
    if (!user) return;

    try {
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: userId,
          is_like: true
        });

      if (swipeError) throw swipeError;

      // Check if it's a match
      const { data: existingSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', userId)
        .eq('swiped_id', user.id)
        .eq('is_like', true)
        .maybeSingle();

      if (existingSwipe) {
        // Create match
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: user.id < userId ? user.id : userId,
            user2_id: user.id < userId ? userId : user.id,
            is_active: true
          });

        if (matchError) throw matchError;

        toast({
          title: "🎉 C'est un match !",
          description: "Vous pouvez maintenant vous envoyer des messages"
        });

        // Refresh matches
        loadMatches();
      } else {
        toast({
          title: "❤️ Like envoyé !",
          description: "Espérons que c'est réciproque !"
        });
      }

      // Remove from received likes
      setReceivedLikes(prev => prev.filter(like => like.profile.user_id !== userId));
      setShowProfileDetail(false);

    } catch (error: any) {
      console.error('Error liking back:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le like",
        variant: "destructive"
      });
    }
  };

  const handleWatchAd = () => {
    // Simulate watching ad
    toast({
      title: "Pub terminée !",
      description: "Vous pouvez maintenant voir qui vous a liké"
    });
    setRevealedLikesCount(receivedLikes.length);
    setShowRevealDialog(false);
  };

  const handlePayToReveal = () => {
    // Would integrate with payment system
    toast({
      title: "Achat effectué !",
      description: "Vous pouvez maintenant voir qui vous a liké"
    });
    setRevealedLikesCount(receivedLikes.length);
    setShowRevealDialog(false);
  };

  if (isEditMode) {
    return (
      <ProfileEditor 
        open={isEditMode}
        onOpenChange={setIsEditMode}
      />
    );
  }

  if (showGivenLikesProfile) {
    return (
      <GivenLikesProfileView
        profile={showGivenLikesProfile}
        onBack={() => setShowGivenLikesProfile(null)}
        onRemoveLike={handleRemoveLike}
      />
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Profil introuvable</h3>
          <p className="text-muted-foreground mb-4">
            Veuillez créer votre profil pour accéder à cette page.
          </p>
          <Button onClick={() => navigate('/profile/edit')}>
            Créer mon profil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-background border-b border-border/10 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => setIsEditMode(true)}
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile Summary Card */}
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarImage src={profile.profile_photo_url} alt={profile.first_name} />
                <AvatarFallback className="text-xl">
                  {profile.first_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground">
                  {profile.first_name}, {profile.age}
                </h2>
                {profile.profession && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span className="text-sm">{profile.profession}</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Activity Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Given Likes */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Likes donnés</h3>
                </div>
                <Badge variant="secondary">
                  {loadingGivenLikes ? '...' : givenLikes.length}
                </Badge>
              </div>
              
              {loadingGivenLikes ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : givenLikes.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {givenLikes.slice(0, 8).map((like) => (
                    <div 
                      key={like.id}
                      className="aspect-square cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      onClick={() => handleGivenLikeClick(like)}
                    >
                      <img
                        src={like.profile.profile_photo_url}
                        alt={like.profile.first_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun like envoyé pour le moment
                </p>
              )}
            </Card>

            {/* Received Likes */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold">Likes reçus</h3>
                </div>
                <Badge variant="secondary">
                  {loadingReceivedLikes ? '...' : receivedLikes.length}
                </Badge>
              </div>
              
              {loadingReceivedLikes ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : receivedLikes.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {receivedLikes.slice(0, revealedLikesCount).map((like) => (
                      <div 
                        key={like.id}
                        className="aspect-square cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                        onClick={() => handleReceivedLikeClick(like)}
                      >
                        <img
                          src={like.profile.profile_photo_url}
                          alt={like.profile.first_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                    {Array.from({ length: Math.min(8, receivedLikes.length - revealedLikesCount) }).map((_, index) => (
                      <div 
                        key={`blurred-${index}`}
                        className="aspect-square rounded-lg overflow-hidden relative cursor-pointer"
                        onClick={() => setShowRevealDialog(true)}
                      >
                        <img
                          src={receivedLikes[revealedLikesCount + index]?.profile.profile_photo_url}
                          alt="Profil masqué"
                          className="w-full h-full object-cover blur-md"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {revealedLikesCount < receivedLikes.length && (
                    <Button 
                      onClick={() => setShowRevealDialog(true)}
                      variant="outline" 
                      className="w-full mt-2"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir {receivedLikes.length - revealedLikesCount} like{receivedLikes.length - revealedLikesCount > 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun like reçu pour le moment
                </p>
              )}
            </Card>

            {/* Matches */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-success" />
                  <h3 className="font-semibold">Matches</h3>
                </div>
                <Badge variant="secondary">
                  {loadingMatches ? '...' : matches.length}
                </Badge>
              </div>
              
              {loadingMatches ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {matches.slice(0, 8).map((match) => (
                    <div 
                      key={match.id}
                      className="aspect-square cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity relative"
                      onClick={() => handleMatchClick(match)}
                    >
                      {match.profile?.profile_photo_url ? (
                        <>
                          <img
                            src={match.profile.profile_photo_url}
                            alt={match.profile.first_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute bottom-1 right-1 bg-success rounded-full p-1">
                            <MessageCircle className="w-3 h-3 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <MessageCircle className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun match pour le moment
                </p>
              )}
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Reveal Dialog */}
      <Dialog open={showRevealDialog} onOpenChange={setShowRevealDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Voir les likes
            </DialogTitle>
            <DialogDescription>
              Découvrez qui vous a liké ! Regardez une pub ou payez pour débloquer immédiatement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {receivedLikes.length - revealedLikesCount} personne{receivedLikes.length - revealedLikesCount > 1 ? 's' : ''} vous {receivedLikes.length - revealedLikesCount > 1 ? 'ont' : 'a'} liké !
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
        onLike={(userId) => handleLikeBack(userId)}
        showLikeButton={true}
      />
    </div>
  );
};

export default ProfileView;