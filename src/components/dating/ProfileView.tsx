import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, MessageCircle, Eye, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SimplifiedProfileView from './SimplifiedProfileView';
import ProfileDetailView from './ProfileDetailView';
import MatchesView from './MatchesView';
import ReceivedLikesView from './ReceivedLikesView';
import GivenLikesView from './GivenLikesView';

interface ProfileViewProps {
  onNavigateToSettings?: () => void;
  onStartChat?: (matchId: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSettings, onStartChat }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);

  const handleWatchAd = async () => {
    toast({
      title: "Publicité regardée",
      description: "Merci ! Vous pouvez maintenant voir les likes."
    });
    setShowAdDialog(false);
  };

  const handlePayToReveal = async () => {
    toast({
      title: "Paiement effectué", 
      description: "Merci ! Vous pouvez maintenant voir les likes."
    });
    setShowAdDialog(false);
  };

  const handleLikeBack = async (profileUserId: string) => {
    toast({
      title: "Like envoyé",
      description: "Votre like a été envoyé !"
    });
  };

  return (
    <div className="h-full bg-background">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-center">Profil</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="px-4 pt-4">

        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="profile" className="mt-0 h-full">
            <SimplifiedProfileView onNavigateToSettings={onNavigateToSettings} />
          </TabsContent>

          <TabsContent value="likes-reçus" className="mt-0 h-full">
            <ReceivedLikesView />
          </TabsContent>

          <TabsContent value="matches" className="mt-0 h-full">
            <MatchesView onStartChat={onStartChat || (() => {})} />
          </TabsContent>

          <TabsContent value="likes-donnés" className="mt-0 h-full">
            <GivenLikesView />
          </TabsContent>
        </div>
      </Tabs>

      {/* Ad Dialog */}
      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Découvrir qui vous a liké</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Pour voir qui vous a liké, vous pouvez soit regarder une publicité, soit payer pour supprimer les pubs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleWatchAd} className="flex items-center justify-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Regarder une pub (Gratuit)</span>
              </Button>
              <Button onClick={handlePayToReveal} variant="outline" className="w-full">
                Payer 0.99€ (Sans pub)
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
        onLike={handleLikeBack}
        showLikeButton={true}
      />
    </div>
  );
};

export default ProfileView;