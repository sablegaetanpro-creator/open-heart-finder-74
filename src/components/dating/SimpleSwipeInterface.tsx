import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { handleSwipe, getDiscoveryProfiles, ProfileForSwipe } from '@/lib/swipeLogic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, X, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react';

export const SimpleSwipeInterface = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileForSwipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  // Charger les profils à découvrir
  useEffect(() => {
    if (!user?.id) return;

    const loadProfiles = async () => {
      setLoading(true);
      try {
        const profilesData = await getDiscoveryProfiles(user.id, 20);
        setProfiles(profilesData);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error loading profiles:', error);
        toast.error('Erreur lors du chargement des profils');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [user?.id]);

  const currentProfile = profiles[currentIndex];

  const performSwipe = async (liked: boolean, superlike: boolean = false) => {
    if (!user?.id || !currentProfile || swiping) return;

    setSwiping(true);
    try {
      const result = await handleSwipe(user.id, currentProfile.user_id, liked, superlike);
      
      if (result.success) {
        // Passer au profil suivant
        setCurrentIndex(prev => prev + 1);
        
        // Afficher popup de match si c'est un match
        if (result.match) {
          toast.success(result.message || "C'est un match ! 🎉", {
            duration: 3000,
          });
        } else if (liked) {
          toast.success("Profil liké ! 👍");
        }
      } else {
        toast.error(result.message || "Erreur lors du swipe");
      }
    } catch (error) {
      console.error('Swipe error:', error);
      toast.error("Erreur lors du swipe");
    } finally {
      setSwiping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Chargement des profils...</div>
      </div>
    );
  }

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Plus de profils pour le moment</h3>
          <p className="text-muted-foreground mb-4">
            Revenez plus tard pour découvrir de nouveaux profils !
          </p>
          <Button onClick={() => window.location.reload()}>
            Actualiser
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden">
        {/* Image principale */}
        <div className="relative h-96 bg-gradient-to-b from-transparent to-black/20">
          <img
            src={currentProfile.profile_photo_url || currentProfile.photos?.[0]}
            alt={currentProfile.display_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-profile.jpg';
            }}
          />
          
          {/* Superlike indicator */}
          {currentProfile.superlike_from_user && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-yellow-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Vous a super liké !
              </Badge>
            </div>
          )}
          
          {/* Informations de base en overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-2xl font-bold">
              {currentProfile.display_name}, {currentProfile.age}
            </h2>
            {currentProfile.profession && (
              <div className="flex items-center mt-1">
                <Briefcase className="h-4 w-4 mr-1" />
                <span className="text-sm">{currentProfile.profession}</span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Bio */}
          {currentProfile.bio && (
            <p className="text-sm text-muted-foreground mb-3">
              {currentProfile.bio}
            </p>
          )}
          
          {/* Détails */}
          <div className="space-y-2 mb-4">
            {currentProfile.education && (
              <div className="flex items-center text-sm">
                <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{currentProfile.education}</span>
              </div>
            )}
            
            {currentProfile.height && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">📏</span>
                <span>{currentProfile.height} cm</span>
              </div>
            )}
            
            {currentProfile.exercise_frequency && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">💪</span>
                <span>{currentProfile.exercise_frequency}</span>
              </div>
            )}
          </div>
          
          {/* Centres d'intérêt */}
          {currentProfile.interests && currentProfile.interests.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Centres d'intérêt</h4>
              <div className="flex flex-wrap gap-1">
                {currentProfile.interests.slice(0, 6).map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Photos additionnelles */}
          {currentProfile.photos && currentProfile.photos.length > 1 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Plus de photos</h4>
              <div className="flex gap-2 overflow-x-auto">
                {currentProfile.photos.slice(1, 4).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 2}`}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-red-200 hover:bg-red-50"
          onClick={() => performSwipe(false)}
          disabled={swiping}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-yellow-200 hover:bg-yellow-50"
          onClick={() => performSwipe(true, true)}
          disabled={swiping}
        >
          <Star className="h-6 w-6 text-yellow-500" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-16 h-16 border-green-200 hover:bg-green-50"
          onClick={() => performSwipe(true)}
          disabled={swiping}
        >
          <Heart className="h-6 w-6 text-green-500" />
        </Button>
      </div>
      
      {/* Indicateur de progression */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {currentIndex + 1} / {profiles.length}
      </div>
    </div>
  );
};