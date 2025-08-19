import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfileDetailView from './ProfileDetailView';

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
}

interface MatchesViewProps {
  onStartChat: (matchId: string) => void;
}

const MatchesView: React.FC<MatchesViewProps> = ({ onStartChat }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [deleteMatchId, setDeleteMatchId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
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
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
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
      toast({
        title: "Erreur",
        description: "Impossible de charger les matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ is_active: false })
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prev => prev.filter(match => match.id !== matchId));
      setShowDeleteDialog(false);
      setDeleteMatchId(null);
      
      toast({
        title: "Match supprimé",
        description: "Le match a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le match. Veuillez réessayer.",
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

    if (diffInHours < 24) {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
          {matches.length > 0 ? (
            matches.map((match) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={match.profile.profile_photo_url} />
                        <AvatarFallback>{match.profile.first_name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate">
                          {match.profile.first_name}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(match.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {match.profile.age} ans • Match depuis le {formatTime(match.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openProfileDetail(match.profile.user_id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Profil
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartChat(match.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDeleteMatchId(match.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun match pour le moment</h3>
                <p className="text-muted-foreground">
                  Continuez à swiper pour trouver votre âme sœur !
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Delete Match Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer ce match ? Le profil retournera dans "Découvrir" et vous ne verrez plus la conversation.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteMatchId && handleDeleteMatch(deleteMatchId)}
                className="flex-1"
              >
                Supprimer
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

export default MatchesView;