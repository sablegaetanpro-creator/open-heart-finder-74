import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface ProfileDetailModalProps {
  profile: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showLikeButton?: boolean;
  onLike?: (userId: string) => void;
  onDeleteMatch?: (userId: string) => void;
  matchId?: string;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  open,
  onOpenChange,
  showLikeButton,
  onLike,
  onDeleteMatch,
  matchId
}) => {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Profil de {profile.first_name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full">
          <div className="relative">
            {/* Alternance identique à Découvrir: photo -> bio -> photo -> intérêts -> photo -> détails -> photos restantes */}
            <div className="w-full max-w-sm mx-auto h-full p-4">
              {(() => {
                const content: React.ReactNode[] = [];
                let pIndex = 0;

                // Photo 1 avec overlay nom/âge
                content.push(
                  <div key="header" className="w-full mb-4">
                    <Card className="overflow-hidden shadow-xl border-0">
                      <div className="relative aspect-[3/4]">
                        <img
                          src={allPhotos[pIndex]}
                          alt={`${profile.first_name} - Photo ${pIndex + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h2 className="text-2xl font-bold">{profile.first_name}, {profile.age}</h2>
                          {profile.profession && (
                            <p className="text-sm text-white/90 mt-1">{profile.profession}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
                pIndex++;

                // Bio
                if (profile.bio) {
                  content.push(
                    <div key="bio" className="w-full mb-4">
                      <Card className="p-6 border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                        <h3 className="text-lg font-semibold mb-3 text-center">À propos</h3>
                        <p className="text-sm text-foreground/80 leading-relaxed text-center">{profile.bio}</p>
                      </Card>
                    </div>
                  );
                  if (pIndex < allPhotos.length) {
                    content.push(
                      <div key={`photo-${pIndex}`} className="w-full mb-4">
                        <Card className="overflow-hidden shadow-xl border-0">
                          <div className="aspect-[3/4]">
                            <img src={allPhotos[pIndex]} alt={`${profile.first_name} - Photo ${pIndex + 1}`} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        </Card>
                      </div>
                    );
                    pIndex++;
                  }
                }

                // Intérêts
                if (profile.interests && profile.interests.length > 0) {
                  content.push(
                    <div key="interests" className="w-full mb-4">
                      <Card className="p-6 border-0 bg-gradient-to-br from-secondary/10 to-secondary/5">
                        <h3 className="text-lg font-semibold mb-3 text-center">Centres d'intérêt</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {profile.interests.slice(0, 12).map((interest, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{interest}</Badge>
                          ))}
                        </div>
                      </Card>
                    </div>
                  );
                  if (pIndex < allPhotos.length) {
                    content.push(
                      <div key={`photo-${pIndex}`} className="w-full mb-4">
                        <Card className="overflow-hidden shadow-xl border-0">
                          <div className="aspect-[3/4]">
                            <img src={allPhotos[pIndex]} alt={`${profile.first_name} - Photo ${pIndex + 1}`} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        </Card>
                      </div>
                    );
                    pIndex++;
                  }
                }

                // Détails (comme Découvrir si présents)
                const hasDetails = (
                  (profile as any).height ||
                  (profile as any).education ||
                  (profile as any).exercise_frequency ||
                  (profile as any).children ||
                  (profile as any).animals ||
                  (profile as any).smoker ||
                  (profile as any).drinks
                );
                if (hasDetails) {
                  content.push(
                    <div key="details" className="w-full mb-4">
                      <Card className="p-6 border-0 bg-gradient-to-br from-accent/10 to-accent/5">
                        <h3 className="text-lg font-semibold mb-3 text-center">Détails</h3>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {(profile as any).height && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Taille</span>
                              <span>{(profile as any).height} cm</span>
                            </div>
                          )}
                          {(profile as any).education && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Éducation</span>
                              <span className="text-right">{(profile as any).education}</span>
                            </div>
                          )}
                          {(profile as any).exercise_frequency && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Sport</span>
                              <span className="text-right">{(profile as any).exercise_frequency}</span>
                            </div>
                          )}
                          {(profile as any).children && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Enfants</span>
                              <span className="text-right">{(profile as any).children}</span>
                            </div>
                          )}
                          {(profile as any).animals && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Animaux</span>
                              <span className="text-right">{(profile as any).animals}</span>
                            </div>
                          )}
                          {(profile as any).smoker && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Tabac</span>
                              <span className="text-right">Fumeur</span>
                            </div>
                          )}
                          {(profile as any).drinks && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Alcool</span>
                              <span className="text-right">{(profile as any).drinks}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                }

                // Photos restantes
                while (pIndex < allPhotos.length) {
                  content.push(
                    <div key={`photo-${pIndex}`} className="w-full mb-4">
                      <Card className="overflow-hidden shadow-xl border-0">
                        <div className="aspect-[3/4]">
                          <img src={allPhotos[pIndex]} alt={`${profile.first_name} - Photo ${pIndex + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      </Card>
                    </div>
                  );
                  pIndex++;
                }

                return content;
              })()}
            </div>
          </div>

          {/* Bouton Dislike en bas uniquement */}
          <div className="flex justify-center items-center py-4">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 p-0 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleClose}
              aria-label="Fermer"
            >
              <X className="w-7 h-7" />
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Boîte de dialogue de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer le match
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirmation pour supprimer le match
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              Êtes-vous sûr de vouloir supprimer ce match ?<br />
              <span className="text-xs text-muted-foreground/70">
                Le profil retournera dans "Découvrir" et vous ne verrez plus la conversation.
              </span>
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={cancelClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClose}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ProfileDetailModal;