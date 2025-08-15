import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MapPin, Briefcase, X } from 'lucide-react';

interface ProfileDetailViewProps {
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    profile_photo_url: string;
    age: number;
    bio?: string;
    profession?: string;
    interests?: string[];
    additional_photos?: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike?: (userId: string) => void;
  showLikeButton?: boolean;
}

const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({
  profile,
  open,
  onOpenChange,
  onLike,
  showLikeButton = false
}) => {
  if (!profile) return null;

  const allPhotos = [];
  if (profile.profile_photo_url) {
    allPhotos.push(profile.profile_photo_url);
  }
  if (profile.additional_photos) {
    allPhotos.push(...profile.additional_photos);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="relative">
            {/* Main Photo */}
            <div className="aspect-[3/4] relative">
              <img
                src={profile.profile_photo_url}
                alt={profile.first_name}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/20 text-white hover:bg-black/40"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {profile.first_name}, {profile.age}
                </h2>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Paris, France</span>
                </div>
                {profile.profession && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>{profile.profession}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="font-semibold mb-2">À propos</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Photos */}
              {allPhotos.length > 1 && (
                <div>
                  <h3 className="font-semibold mb-2">Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {allPhotos.slice(1).map((photo, index) => (
                      <div key={index} className="aspect-square">
                        <img
                          src={photo}
                          alt={`Photo ${index + 2}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Like Button */}
              {showLikeButton && onLike && (
                <div className="pt-4">
                  <Button
                    onClick={() => onLike(profile.user_id)}
                    className="w-full bg-gradient-love text-white"
                    size="lg"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Liker en retour
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDetailView;