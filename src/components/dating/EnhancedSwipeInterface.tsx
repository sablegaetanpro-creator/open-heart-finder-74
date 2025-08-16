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
      if (user && profile) {
        loadProfiles();
      }
    };

    window.addEventListener('refresh-data', handleDataRefresh);
    return () => window.removeEventListener('refresh-data', handleDataRefresh);
  }, [user, profile]);

  const loadProfiles = async (forceRefresh = false) => {
    if (!user || !profile) return;

    try {
      // Si forceRefresh, on ignore les swipes récents pour voir plus de profils
      let swipedIds: any[] = [];
      
      if (!forceRefresh) {
        const { data: recentSwipes } = await supabase
          .from('swipes')
          .select('swiped_id')
          .eq('swiper_id', user.id)
          .or('is_like.eq.true,created_at.gte.' + new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString());
        swipedIds = recentSwipes || [];
      }

      const swipedUserIds = (swipedIds || []).map(s => s.swiped_id).filter(Boolean);

      // Construire la requête de base
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_profile_complete', true)
        .neq('user_id', user.id); // Exclure l'utilisateur actuel

      // Exclure les profils déjà swipés (sauf si forceRefresh)
      if (!forceRefresh && swipedUserIds.length > 0) {
        const list = swipedUserIds.map((id: string) => `'${id}'`).join(',');
        query = query.not('user_id', 'in', `(${list})`);
      }

      // Apply basic compatibility filters
      if (profile.looking_for !== 'les_deux') {
        query = query.eq('gender', profile.looking_for);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Erreur requête profils:', error);
        throw error;
      }

      // Read saved filters
      const savedFiltersRaw = localStorage.getItem('dating_filters');
      const savedFilters = savedFiltersRaw ? JSON.parse(savedFiltersRaw) : null;

      // Helpers distance
      const parseLatLng = (location?: string): { lat: number; lng: number } | null => {
        if (!location) return null;
        const parts = location.split(',').map(p => parseFloat(p.trim()));
        if (parts.length !== 2 || parts.some(n => Number.isNaN(n))) return null;
        return { lat: parts[0], lng: parts[1] };
      };
      const haversineKm = (a?: string, b?: string): number | null => {
        const A = parseLatLng(a);
        const B = parseLatLng(b);
        if (!A || !B) return null;
        const toRad = (v: number) => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(B.lat - A.lat);
        const dLng = toRad(B.lng - A.lng);
        const lat1 = toRad(A.lat);
        const lat2 = toRad(B.lat);
        const h = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
        return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
      };

      // Filter by mutual compatibility + all saved filters
      const compatibleProfiles = data?.filter(p => {
        // compatibilité réciproque
        const genderOk = (profile.looking_for === 'les_deux' || p.gender === profile.looking_for) &&
                         (p.looking_for === 'les_deux' || p.looking_for === profile.gender);
        if (!genderOk) return false;
        if (!savedFilters) return true;

        if (savedFilters.gender && savedFilters.gender !== 'tous' && p.gender !== savedFilters.gender) return false;
        if (savedFilters.ageRange && (p.age < savedFilters.ageRange[0] || p.age > savedFilters.ageRange[1])) return false;
        if (savedFilters.relationshipType && savedFilters.relationshipType !== 'tous' && p.relationship_type !== savedFilters.relationshipType) return false;
        if (savedFilters.height && (p.height == null || p.height < savedFilters.height[0] || p.height > savedFilters.height[1])) return false;
        if (savedFilters.bodyType?.length && !savedFilters.bodyType.includes(p.body_type || '')) return false;
        if (savedFilters.smoker && savedFilters.smoker !== 'tous' && String(p.smoker) !== savedFilters.smoker) return false;
        if (savedFilters.drinks && savedFilters.drinks !== 'tous' && p.drinks !== savedFilters.drinks) return false;
        if (savedFilters.animals && savedFilters.animals !== 'tous' && p.animals !== savedFilters.animals) return false;
        if (savedFilters.children && savedFilters.children !== 'tous' && p.children !== savedFilters.children) return false;
        if (savedFilters.exerciseFrequency && savedFilters.exerciseFrequency !== 'tous' && p.exercise_frequency !== savedFilters.exerciseFrequency) return false;
        if (savedFilters.religion?.length && !savedFilters.religion.includes(p.religion || '')) return false;
        if (savedFilters.politics?.length && !savedFilters.politics.includes(p.politics || '')) return false;
        if (savedFilters.education?.length && !savedFilters.education.some((v: string) => (p.education || '').includes(v))) return false;
        if (savedFilters.profession?.length && !savedFilters.profession.some((v: string) => (p.profession || '').includes(v))) return false;
        if (savedFilters.interests?.length) {
          const hasCommon = (p.interests || []).some((i: string) => savedFilters.interests.includes(i));
          if (!hasCommon) return false;
        }
        if (typeof savedFilters.maxDistance === 'number') {
          const d = haversineKm(profile.location, p.location);
          if (d != null && d > savedFilters.maxDistance) return false;
        }
        return true;
      }) || [];

      // Stats de chargement (désactiver en prod)
      
      setProfiles(compatibleProfiles as Profile[]);
      setCurrentIndex(0);
      
      // Afficher le toast seulement pour les rechargements manuels (pas le chargement initial)
      if (profiles.length > 0 || forceRefresh) {
        toast({
          title: forceRefresh ? "Filtres appliqués !" : "Profils rechargés !",
          description: `${compatibleProfiles.length} profils disponibles`
        });
      }
    } catch (error: any) {
      console.error('Erreur loadProfiles:', error);
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
      const target = profiles.find(p => p.id === profileId);
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: target?.user_id || '',
          is_like: isLike
        });

      if (swipeError) throw swipeError;

      if (isLike) {
        // Check if it's a match - use maybeSingle() to avoid errors
        const swipedProfile = profiles.find(p => p.id === profileId);
        const { data: existingSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', swipedProfile?.user_id || '')
          .eq('swiped_id', user.id)
          .eq('is_like', true)
          .maybeSingle();

        if (existingSwipe) {
          // Create the match if it doesn't exist
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('*')
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${swipedProfile?.user_id}),and(user1_id.eq.${swipedProfile?.user_id},user2_id.eq.${user.id})`)
            .maybeSingle();

          if (!existingMatch) {
            await supabase
              .from('matches')
              .insert({
                user1_id: user.id < (swipedProfile?.user_id || '') ? user.id : (swipedProfile?.user_id || ''),
                user2_id: user.id < (swipedProfile?.user_id || '') ? (swipedProfile?.user_id || '') : user.id,
                is_active: true
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
                 loadProfiles(true); // Force refresh avec filtres
               }} 
               variant="outline" 
               className="mt-4"
               disabled={isLoading}
             >
               {isLoading ? 'Chargement...' : '🔄 Appliquer les filtres'}
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