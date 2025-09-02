import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import GivenLikesVerticalCard from './GivenLikesVerticalCard';
import BackButton from './BackButton';

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

interface GivenLikesProfileViewProps {
  profile: Profile;
  onBack: () => void;
  onRemoveLike: (profileId: string) => void;
}

const GivenLikesProfileView: React.FC<GivenLikesProfileViewProps> = ({ 
  profile, 
  onBack, 
  onRemoveLike 
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveLike = useCallback(async (profileId: string) => {
    if (isProcessing || !user) return;
    
    setIsProcessing(true);
    try {
      console.log('🔄 Démarrage de la suppression du like pour:', profile.first_name, profileId);
      
      // Suppression du swipe dans Supabase
      const { error: supabaseError } = await supabase
        .from('swipes') 
        .delete()
        .eq('swiper_id', user.id)
        .eq('swiped_id', profileId);

      console.log('📊 Résultat de la suppression Supabase:', { supabaseError });

      if (supabaseError) {
        console.error('❌ Erreur SQL Supabase:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Swipe supprimé de Supabase');

      // Suppression locale aussi
      const localSwipes = await offlineDataManager.getUserSwipes(user.id);
      const swipeToDelete = localSwipes.find(swipe => 
        swipe.swiper_id === user.id && swipe.swiped_id === profileId
      );

      if (swipeToDelete) {
        await offlineDataManager.deleteSwipe(swipeToDelete.id);
        console.log('✅ Swipe supprimé localement');
      }

      // Suppression réussie
      toast({
        title: "✅ Like retiré avec succès", 
        description: `${profile.first_name} retournera dans Découvrir`,
        duration: 4000
      });

      // Call the callback to handle navigation and refresh
      onRemoveLike(profileId);
      onBack();
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression du like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le like. Veuillez réessayer.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, user, profile, onRemoveLike, onBack]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border/10">
        <BackButton onBack={onBack} />
        <h1 className="text-lg font-semibold">Profil liké</h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </div>

      {/* Vertical Card like in Discovery */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <GivenLikesVerticalCard
            profile={profile}
            onRemoveLike={handleRemoveLike}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default GivenLikesProfileView;