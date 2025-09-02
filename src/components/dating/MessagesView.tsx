import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Lock, 
  Play, 
  Bot,
  Plus,
  Camera,
  Video,
  Mic,
  MoreHorizontal,
  AlertTriangle,
  ArrowLeft,
  Send,
  Smile,
  Image,
  FileImage,
  Clock,
  MoreVertical,
  Popover,
  PopoverContent,
  PopoverTrigger
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import ChatInterface from './ChatInterface';
import ProfileDetailView from './ProfileDetailView';
import AssistantCard from './AssistantCard';
import MatchCard from './MatchCard';
import LoadingMessages from './LoadingMessages';
import EmptyMatchesView from './EmptyMatchesView';
import MatchesSection from './MatchesSection';
import AdRevealDialog from './AdRevealDialog';
import LikesListDialog from './LikesListDialog';
import MessagesHeader from './MessagesHeader';
import MessagesListSection from './MessagesListSection';

interface MatchWithProfile {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  is_active: boolean;
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    profile_photo_url: string;
    age: number;
  };
  lastMessage?: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
}

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

interface MessagesViewProps {
  onStartChat: (matchId: string) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ onStartChat }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([]);
  const [givenLikes, setGivenLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [showGivenLikesDialog, setShowGivenLikesDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [hasRevealedLikes, setHasRevealedLikes] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);

  // Admin user mock
  const adminUser = {
    id: 'admin',
    name: 'Assistant',
    avatar: '/placeholder.svg',
    age: 0
  };

  useEffect(() => {
    if (user) {
      loadData();
      
      // Subscribe to real-time updates
      const matchesSubscription = supabase
        .channel('matches-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'matches'
        }, () => {
          loadMatches();
        })
        .subscribe();

      const messagesSubscription = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, () => {
          loadMatches();
        })
        .subscribe();

      // Écouter les événements de rafraîchissement
      const handleRefresh = () => {
        console.log('🔄 Rafraîchissement des messages...');
        loadData();
      };
      
      window.addEventListener('refresh-data', handleRefresh);

      return () => {
        matchesSubscription.unsubscribe();
        messagesSubscription.unsubscribe();
        window.removeEventListener('refresh-data', handleRefresh);
      };
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadMatches(),
      loadReceivedLikes(),
      loadGivenLikes(),
      checkRevealedLikes()
    ]);
    setLoading(false);
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

      // Process matches to get other user's profile and last message
      const processedMatches = await Promise.all(
        (matchesData || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const otherProfile = match.user1_id === user.id ? match.user2_profile : match.user1_profile;

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...match,
            profile: {
              id: otherProfile.id,
              user_id: otherProfile.user_id,
              first_name: otherProfile.first_name,
              profile_photo_url: otherProfile.profile_photo_url,
              age: otherProfile.age
            },
            lastMessage: lastMessageData?.[0],
            unreadCount: unreadCount || 0
          };
        })
      );

      // Ajouter les matches locaux si aucun match Supabase
      if (processedMatches.length === 0) {
        const { offlineDataManager } = await import('@/lib/offlineDataManager');
        const localMatches = await offlineDataManager.getUserMatches(user.id);
        if (localMatches.length > 0) {
          console.log('📱 Affichage des matches locaux:', localMatches.length);
          // Convertir les matches locaux au bon format avec vraies données de profil
          const localMatchesFormatted = await Promise.all(
            localMatches.map(async (match) => {
              const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
              
              // Essayer de récupérer le vrai profil depuis Supabase
              let otherProfile = null;
              try {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', otherUserId)
                  .maybeSingle();
                otherProfile = profileData;
              } catch (error) {
                console.log('Could not fetch profile from Supabase, using offline data');
              }
              
              // Sinon, essayer depuis la base locale
              if (!otherProfile) {
                otherProfile = await offlineDataManager.getProfileByUserId(otherUserId);
              }
              
              return {
                ...match,
                profile: {
                  id: otherProfile?.id || otherUserId,
                  user_id: otherUserId,
                  first_name: otherProfile?.first_name || 'Utilisateur',
                  profile_photo_url: otherProfile?.profile_photo_url || '/placeholder.svg',
                  age: otherProfile?.age || 25
                },
                lastMessage: null,
                unreadCount: 0
              };
            })
          );
          setMatches(localMatchesFormatted);
          return;
        }
      }
      
      setMatches(processedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  // Ouvrir la fiche profil complète (avec bio, etc.) depuis la messagerie
  const openProfileByUserId = async (userId: string | undefined) => {
    if (!userId) return;
    console.log('🔄 Chargement du profil pour user_id:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        return;
      }
      
      if (data) {
        console.log('✅ Profil chargé:', data);
        setSelectedProfile(data);
        setShowProfileDetail(true);
      } else {
        console.log('⚠️ Aucun profil trouvé pour user_id:', userId);
      }
    } catch (e) {
      console.error('❌ Erreur loading profile detail from chat header:', e);
    }
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

      setGivenLikes(processedLikes);
    } catch (error) {
      console.error('Error loading given likes:', error);
    }
  };

  const checkRevealedLikes = async () => {
    if (!user) return;

    // Désactiver pour l'instant - table likes_revealed n'existe pas
    // try {
    //   const { data, error } = await supabase
    //     .from('likes_revealed')
    //     .select('*')
    //     .eq('user_id', user.id)
    //     .maybeSingle();

    //   if (error && (error as any).status !== 406 && error.code !== 'PGRST116') throw error;
    //   setHasRevealedLikes(!!data);
    // } catch (error) {
    //   console.error('Error checking revealed likes:', error);
    // }
    setHasRevealedLikes(false);
  };

  const handleRevealLikes = () => {
    if (hasRevealedLikes) {
      setShowLikesDialog(true);
    } else {
      setShowAdDialog(true);
    }
  };

  const handleWatchAd = async () => {
    // Simulate watching an ad
    toast({
      title: "Publicité regardée !",
      description: "Vous pouvez maintenant voir qui vous a liké"
    });

    // Record that user has revealed likes
    // Désactiver pour l'instant - table likes_revealed n'existe pas
    // try {
    //   await supabase
    //     .from('likes_revealed')
    //     .insert({
    //       user_id: user?.id,
    //       liker_id: receivedLikes[0]?.swiper_id || 'unknown',
    //       revealed_by: 'ad'
    //     });
    // } catch (error) {
    //   console.error('Error recording revealed likes:', error);
    // }
  };

  const handlePayToReveal = async () => {
    // Simulate payment
    toast({
      title: "Paiement effectué !",
      description: "Vous pouvez maintenant voir qui vous a liké"
    });

    // Record that user has revealed likes
    // Désactiver pour l'instant - table likes_revealed n'existe pas
    // try {
    //   await supabase
    //     .from('likes_revealed')
    //     .insert({
    //       user_id: user?.id,
    //       liker_id: receivedLikes[0]?.swiper_id || 'unknown',
    //       revealed_by: 'payment'
    //     });
    // } catch (error) {
    //   console.error('Error recording revealed likes:', error);
    // }
  };

  const formatLastMessage = (message: any) => {
    if (!message) return 'Commencez la conversation...';
    
    const isOwn = message.sender_id === user?.id;
    const prefix = isOwn ? 'Vous: ' : '';
    return `${prefix}${message.content}`;
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

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <MessagesHeader 
        onRevealLikes={handleRevealLikes}
        hiddenLikesCount={receivedLikes.length}
      />

      <LoadingMessages loading={loading} />

      {!loading && (
        <ScrollArea className="flex-1 pb-20">
          <div className="p-4 space-y-4">
            {/* Assistant Support */}
            <AssistantCard onClick={() => setShowAdminChat(true)} />

            {/* Matches List */}
            <MessagesListSection 
              matches={matches}
              onMatchClick={(match) => {
                setSelectedMatch(match);
                setShowChat(true);
              }}
              loading={loading}
            />
          </div>
        </ScrollArea>
      )}

      {/* Ad Dialog */}
      <AdRevealDialog
        open={showAdDialog}
        onOpenChange={setShowAdDialog}
        onWatchAd={handleWatchAd}
        onPayToReveal={handlePayToReveal}
      />

      {/* Received Likes Dialog */}
      <LikesListDialog
        open={showLikesDialog}
        onOpenChange={setShowLikesDialog}
        likes={receivedLikes}
        title="Personnes qui vous ont liké"
        emptyMessage="Personne ne vous a encore liké"
      />

      {/* Given Likes Dialog */}
      <LikesListDialog
        open={showGivenLikesDialog}
        onOpenChange={setShowGivenLikesDialog}
        likes={givenLikes}
        title="Personnes que vous avez likées"
        emptyMessage="Vous n'avez encore liké personne"
      />

      {/* Chat Interface */}
      {selectedMatch && showChat && (
        <ChatInterface
          matchId={selectedMatch.id}
          otherUser={{
            id: selectedMatch.profile.id,
            name: selectedMatch.profile.first_name,
            avatar: selectedMatch.profile.profile_photo_url,
            age: selectedMatch.profile.age,
          }}
          onBack={() => setShowChat(false)}
          onShowProfile={() => {
            setShowChat(false);
            openProfileByUserId(selectedMatch.profile.user_id);
          }}
          onStartChat={onStartChat}
        />
      )}

      {/* Admin Chat Interface */}
      {showAdminChat && (
        <ChatInterface
          matchId="admin-support"
          otherUser={adminUser}
          onBack={() => setShowAdminChat(false)}
          onShowProfile={() => {
            setShowAdminChat(false);
          }}
        />
      )}

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

export default MessagesView;