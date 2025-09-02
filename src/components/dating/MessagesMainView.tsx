import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface MessagesMainViewProps {
  matches: any[];
  receivedLikes: any[];
  givenLikes: any[];
  showAdDialog: boolean;
  showLikesDialog: boolean;
  showGivenLikesDialog: boolean;
  showChat: boolean;
  showAdminChat: boolean;
  selectedMatch: any;
  adminUser: any;
  selectedProfile: any;
  showProfileDetail: boolean;
  setShowAdDialog: (open: boolean) => void;
  setShowLikesDialog: (open: boolean) => void;
  setShowGivenLikesDialog: (open: boolean) => void;
  setShowChat: (open: boolean) => void;
  setShowAdminChat: (open: boolean) => void;
  openProfileByUserId: (userId: string) => void;
  handleWatchAd: () => void;
  handlePayToReveal: () => void;
  handleRevealLikes: () => void;
  hasRevealedLikes: boolean;
}

const MessagesMainView: React.FC<MessagesMainViewProps> = ({
  matches,
  receivedLikes,
  givenLikes,
  showAdDialog,
  showLikesDialog,
  showGivenLikesDialog,
  showChat,
  showAdminChat,
  selectedMatch,
  adminUser,
  selectedProfile,
  showProfileDetail,
  setShowAdDialog,
  setShowLikesDialog,
  setShowGivenLikesDialog,
  setShowChat,
  setShowAdminChat,
  openProfileByUserId,
  handleWatchAd,
  handlePayToReveal,
  handleRevealLikes,
  hasRevealedLikes
}) => {
  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-center">Messages</h1>
      </div>

      <ScrollArea className="flex-1 pb-20">
        <div className="p-4 space-y-4">
          {/* Assistant Support */}
          <AssistantCard onClick={() => setShowAdminChat(true)} />

          {/* Matches List */}
          {matches.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Vos matches</h2>
              {matches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  onMatchClick={() => {
                    setSelectedMatch(match);
                    setShowChat(true);
                  }} 
                />
              ))}
            </div>
          )}

          {matches.length === 0 && (
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

      {/* Ad Dialog */}
      <AdRevealDialog
        open={showAdDialog}
        onOpenChange={setShowAdDialog}
        onWatchAd={handleWatchAd}
        onPayToReveal={handlePayToReveal}
      />

      {/* Received Likes Dialog */}
      <LikesListDialog
        open={showLikesDialog}
        onOpenChange={setShowLikesDialog}
        likes={receivedLikes}
        title="Personnes qui vous ont liké"
        emptyMessage="Personne ne vous a encore liké"
      />

      {/* Given Likes Dialog */}
      <LikesListDialog
        open={showGivenLikesDialog}
        onOpenChange={setShowGivenLikesDialog}
        likes={givenLikes}
        title="Personnes que vous avez likées"
        emptyMessage="Vous n'avez encore liké personne"
      />

      {/* Chat Interface (enhanced with media upload) */}
      {selectedMatch && showChat && (
        <ChatInterface
          matchId={selectedMatch.id}
          otherUser={{
            id: selectedMatch.profile.id,
            name: selectedMatch.profile.first_name,
            avatar: selectedMatch.profile.profile_photo_url,
            age: selectedMatch.profile.age,
          }}
          onBack={() => setShowChat(false)}
          onShowProfile={() => {
            setShowChat(false);
            openProfileByUserId(selectedMatch.profile.user_id);
          }}
        />
      )}

      {/* Admin Chat Interface */}
      {showAdminChat && (
        <ChatInterface
          matchId="admin-support"
          otherUser={adminUser}
          onBack={() => setShowAdminChat(false)}
          onShowProfile={() => {
            setShowAdminChat(false);
          }}
        />
      )}

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

export default MessagesMainView;