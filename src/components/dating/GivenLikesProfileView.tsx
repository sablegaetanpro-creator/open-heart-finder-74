import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { simpleDataManager } from '@/lib/simpleDataManager';
import GivenLikesVerticalCard from './GivenLikesVerticalCard';

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
      console.log('🔄 GivenLikesProfileView - Suppression du like pour:', profile.first_name, profileId);
      
      // ONLY handle the deletion - no navigation or state management
      await simpleDataManager.removeLike(user.id, profileId);

      console.log('✅ Like supprimé avec succès dans GivenLikesProfileView');
      
      toast({
        title: "✅ Like retiré avec succès", 
        description: `${profile.first_name} retournera dans Découvrir`,
        duration: 4000
      });

      // Call the callback for state management and navigation
      onRemoveLike(profileId);
      
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
  }, [isProcessing, user, profile, onRemoveLike]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between p-4 bg-background border-b border-border/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
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