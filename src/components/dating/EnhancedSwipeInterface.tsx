import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Filter, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import SwipeableCard from './SwipeableCard';
import EnhancedFilterDialog from './EnhancedFilterDialog';

interface EnhancedSwipeInterfaceProps {
  onAdView?: () => void;
}

const EnhancedSwipeInterface: React.FC<EnhancedSwipeInterfaceProps> = ({ onAdView }) => {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadProfiles();
    }
  }, [user, profile]);

  // Listen for data refresh events (triggered when a like is removed)
  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('🔄 Rafraîchissement des données de découverte suite à suppression de like');
      if (user && profile) {
        loadProfiles();
      }
    };

    window.addEventListener('refresh-data', handleDataRefresh);
    return () => window.removeEventListener('refresh-data', handleDataRefresh);
  }, [user, profile]);

  const loadProfiles = async () => {
    if (!user || !profile) return;

    try {
      // Get recent swipes (dislikes older than 15 days are ignored)
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id)
        .or('is_like.eq.true,created_at.gte.' + new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString());

      const excludeIds = [user.id, ...(swipedIds?.map(s => s.swiped_id) || [])];

      let query = supabase
        .from('profiles')
        .select('*')
        .not('user_id', 'in', `(${excludeIds.join(',')})`)
        .eq('is_profile_complete', true);
        // Retirer temporairement le filtre is_verified pour voir les profils

      // Apply basic compatibility filters
      if (profile.looking_for !== 'les_deux') {
        query = query.eq('gender', profile.looking_for);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Filter by mutual compatibility
      const compatibleProfiles = data?.filter(p => {
        if (p.looking_for === 'les_deux') return true;
        return p.looking_for === profile.gender;
      }) || [];

      setProfiles(compatibleProfiles as Profile[]);
      setCurrentIndex(0);
      
      // Afficher le toast seulement pour les rechargements manuels (pas le chargement initial)
      if (profiles.length > 0) {
        toast({
          title: "Profils rechargés !",
          description: `${compatibleProfiles.length} nouveaux profils disponibles`
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les profils",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', profileId: string) => {
    if (!user) return;

    const isLike = direction === 'right';

    try {
      // Record swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: profileId,
          is_like: isLike
        });

      if (swipeError) throw swipeError;

      if (isLike) {
        // Check if it's a match - use maybeSingle() to avoid errors
        const { data: existingSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', profileId)
          .eq('swiped_id', user.id)
          .eq('is_like', true)
          .maybeSingle();

        if (existingSwipe) {
          // Create the match if it doesn't exist
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('*')
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
            .maybeSingle();

          if (!existingMatch) {
            await supabase
              .from('matches')
              .insert({
                user1_id: user.id < profileId ? user.id : profileId,
                user2_id: user.id < profileId ? profileId : user.id
              });
          }

          toast({
            title: "🎉 C'est un match !",
            description: "Vous pouvez maintenant vous envoyer des messages"
          });
        } else {
          toast({
            title: "❤️ Like envoyé !",
            description: "Espérons que c'est réciproque !"
          });
        }
      }

      // Avancer au profil suivant
      setCurrentIndex(prev => prev + 1);
      setSwipeCount(prev => prev + 1);

      // Recharger les profils après quelques swipes
      if (swipeCount > 0 && swipeCount % 5 === 0) {
        loadProfiles();
      }

      // Show ad every 10 swipes
      if ((swipeCount + 1) % 10 === 0 && onAdView) {
        onAdView();
      }

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le swipe",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-love rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Plus de profils !</h3>
          <p className="text-muted-foreground mb-6">
            Revenez plus tard pour découvrir de nouveaux profils ou ajustez vos filtres.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => setShowFilterDialog(true)} 
              variant="outline" 
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Modifier les filtres
            </Button>
            <Button 
              onClick={() => {
                setIsLoading(true);
                loadProfiles();
              }} 
              variant="outline" 
              className="mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : '🔄 Recharger les profils'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{profiles.length - currentIndex} profils</Badge>
          {swipeCount > 0 && (
            <Badge variant="secondary">{swipeCount} swipes</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowFilterDialog(true)}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Swipe Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm h-[600px]">
          <AnimatePresence mode="wait">
            {currentProfile && (
              <SwipeableCard
                key={currentProfile.id}
                profile={currentProfile}
                onSwipe={handleSwipe}
                style={{ position: 'absolute', inset: 0 }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className="flex justify-center space-x-6">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14 border-2 border-dislike hover:bg-dislike hover:text-dislike-foreground"
            onClick={() => handleSwipe('left', currentProfile?.id)}
          >
            <X className="w-6 h-6" />
          </Button>
          
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-love shadow-love animate-love-pulse"
            onClick={() => handleSwipe('right', currentProfile?.id)}
          >
            <Heart className="w-8 h-8 text-white fill-current" />
          </Button>
        </div>
      </div>

        <EnhancedFilterDialog 
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          onFiltersApply={loadProfiles}
        />
    </div>
  );
};

export default EnhancedSwipeInterface;