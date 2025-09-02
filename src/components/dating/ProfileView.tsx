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
import ProfileStats from './ProfileStats';
import ProfileSummary from './ProfileSummary';
import RevealLikesDialog from './RevealLikesDialog';
import ProfileEditButton from './ProfileEditButton';

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
      // Use the new RPC function to bypass RLS restrictions
      const { data: likesData, error: likesError } = await supabase
        .rpc('get_given_likes_profiles', { target_user_id: user.id });

      console.log('💕 Given likes via RPC:', likesData);

      if (likesError) {
        console.error('❌ Error loading given likes via RPC:', likesError);
        throw likesError;
      }

      if (!likesData || likesData.length === 0) {
        console.log('📭 No given likes found');
        setGivenLikes([]);
        return;
      }

      // Transform the RPC data to match our interface
      const transformedLikes = likesData.map((item: any) => ({
        id: item.swipe_id,
        swiper_id: item.swiper_id,
        swiped_id: item.swiped_id,
        created_at: item.created_at,
        profile: {
          id: item.profile_id,
          user_id: item.swiped_id,
          first_name: item.first_name,
          age: item.age,
          profile_photo_url: item.profile_photo_url,
          bio: item.bio,
          profession: item.profession,
          interests: item.interests,
          height: item.height,
          education: item.education,
          exercise_frequency: item.exercise_frequency,
          children: item.children,
          animals: item.animals,
          smoker: item.smoker,
          drinks: item.drinks,
          additional_photos: item.additional_photos
        }
      }));

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

  const handleRemoveLike = useCallback(async (profileId: string) => {
    if (!user) return;

    try {
      // Remove the swipe instead of adding a new one
      const { error: deleteError } = await supabase
        .from('swipes')
        .delete()
        .eq('swiper_id', user.id)
        .eq('swiped_id', profileId);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        toast({
          title: "Erreur",
          description: "Impossible de retirer le like",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setGivenLikes(prev => prev.filter(like => like.profile.user_id !== profileId));
      
      toast({
        title: "✅ Like retiré",
        description: "Le like a été retiré avec succès"
      });

    } catch (error: any) {
      console.error('Error in handleRemoveLike:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le like",
        variant: "destructive"
      });
    }
  }, [user, toast]);

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
          <ProfileEditButton onEditClick={() => setIsEditMode(true)} />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile Summary Card */}
          <ProfileSummary 
            profile={profile} 
            onEditClick={() => setIsEditMode(true)} 
          />

          {/* Activity Cards */}
          <ProfileStats
            givenLikesCount={givenLikes.length}
            receivedLikesCount={receivedLikes.length}
            matchesCount={matches.length}
            loadingGivenLikes={loadingGivenLikes}
            loadingReceivedLikes={loadingReceivedLikes}
            loadingMatches={loadingMatches}
            onGivenLikesClick={() => {}}
            onReceivedLikesClick={() => {}}
            onMatchesClick={() => {}}
          />
        </div>
      </ScrollArea>

      {/* Reveal Dialog */}
      <RevealLikesDialog
        open={showRevealDialog}
        onOpenChange={setShowRevealDialog}
        onWatchAd={handleWatchAd}
        onPayToReveal={handlePayToReveal}
        hiddenLikesCount={receivedLikes.length - revealedLikesCount}
      />

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