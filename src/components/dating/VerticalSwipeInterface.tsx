import React, { useState, useEffect } from 'react';
import { Heart, X, Filter, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import VerticalProfileCard from './VerticalProfileCard';
import EnhancedFilterDialog from './EnhancedFilterDialog';

interface VerticalSwipeInterfaceProps {
  onAdView?: () => void;
}

const VerticalSwipeInterface: React.FC<VerticalSwipeInterfaceProps> = ({ onAdView }) => {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  useEffect(() => {
    if (user && profile) {
      loadProfiles();
    }
  }, [user, profile]);

  const loadProfiles = async () => {
    if (!user || !profile) return;

    try {
      // Get profiles that haven't been swiped yet
      const { data: swipedIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const excludeIds = [user.id, ...(swipedIds?.map(s => s.swiped_id) || [])];

      let query = supabase
        .from('profiles')
        .select('*')
        .not('user_id', 'in', `(${excludeIds.join(',')})`)
        .eq('is_profile_complete', true);

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
      
      // Show toast only for manual reloads (not initial load)
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
        // Check if it's a match
        const { data: existingSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', profileId)
          .eq('swiped_id', user.id)
          .eq('is_like', true)
          .single();

        if (existingSwipe) {
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

      // Remove swiped profile from list
      setProfiles(prev => prev.filter(p => p.user_id !== profileId));
      setSwipeCount(prev => prev + 1);

      // Reload profiles after some swipes
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

  if (profiles.length === 0) {
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
              onClick={() => {
                window.location.hash = '#settings';
                window.location.reload();
              }} 
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

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-background border-b border-border/10">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{profiles.length} profils</Badge>
          {swipeCount > 0 && (
            <Badge variant="secondary">{swipeCount} swipes</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            window.location.hash = '#settings';
            window.location.reload();
          }}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Vertical Scrolling Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {profiles.map((profile) => (
            <VerticalProfileCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
            />
          ))}
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

export default VerticalSwipeInterface;